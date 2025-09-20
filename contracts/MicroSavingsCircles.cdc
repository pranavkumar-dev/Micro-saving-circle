access(all) contract MicroSavingsCircles {

	import FungibleToken from 0xee82856bf20e2aa6
	import FlowToken from 0x0ae53cb6e3f42a79

	access(all) let FlowTokenReceiverPublicPath: PublicPath

	access(all) struct CircleView {
		access(all) let circleId: UInt64
		access(all) let poolSize: UFix64
		access(all) let members: [Address]
		access(all) let maxMembers: UInt8
		access(all) let totalRounds: UInt8
		access(all) let currentRound: UInt8
		access(all) let payoutHistory: [Address?]
		access(all) let currentRoundDeposited: {Address: Bool}

		init(
			circleId: UInt64,
			poolSize: UFix64,
			members: [Address],
			maxMembers: UInt8,
			totalRounds: UInt8,
			currentRound: UInt8,
			payoutHistory: [Address?],
			currentRoundDeposited: {Address: Bool}
		) {
			self.circleId = circleId
			self.poolSize = poolSize
			self.members = members
			self.maxMembers = maxMembers
			self.totalRounds = totalRounds
			self.currentRound = currentRound
			self.payoutHistory = payoutHistory
			self.currentRoundDeposited = currentRoundDeposited
		}
	}

	access(self) resource EscrowVault {
		access(self) var vault: @FungibleToken.Vault

		init() {
			self.vault <- FlowToken.createEmptyVault()
		}

		access(self) fun deposit(from: @FungibleToken.Vault) {
			self.vault.deposit(from: <-from)
		}

		access(self) fun withdrawAll(): @FungibleToken.Vault {
			let amount: UFix64 = self.vault.balance
			return <- self.vault.withdraw(amount: amount)
		}

		destroy() {
			destroy self.vault
		}
	}

	access(all) resource Circle {
		access(all) let circleId: UInt64
		access(all) let poolSize: UFix64
		access(all) let maxMembers: UInt8
		access(all) var members: [Address]
		access(all) let totalRounds: UInt8
		access(all) var currentRound: UInt8
		access(all) var payoutHistory: [Address?]
		access(all) var hasReceivedPayout: {Address: Bool}
		access(all) var hasDepositedThisRound: {Address: Bool}
		access(self) var escrow: @EscrowVault

		init(circleId: UInt64, poolSize: UFix64, maxMembers: UInt8) {
			pre {
				poolSize > 0.0: "Pool size must be positive"
				maxMembers >= 3 && maxMembers <= 10: "Members must be between 3 and 10"
			}
			self.circleId = circleId
			self.poolSize = poolSize
			self.maxMembers = maxMembers
			self.members = []
			self.totalRounds = maxMembers
			self.currentRound = 0
			self.payoutHistory = []
			self.hasReceivedPayout = {}
			self.hasDepositedThisRound = {}
			self.escrow <- create EscrowVault()
		}

		access(all) fun join(member: Address) {
			pre {
				self.members.length < Int(self.maxMembers): "Circle is full"
				self.members.contains(member) == false: "Member already joined"
			}
			self.members.append(member)
			self.hasReceivedPayout[member] = false
		}

		access(all) fun deposit(from: @FungibleToken.Vault, depositor: Address) {
			pre {
				self.members.contains(depositor): "Depositor is not a member"
				self.hasDepositedThisRound[depositor] != true: "Already deposited this round"
				from.balance == self.poolSize: "Deposit must equal pool size"
			}
			self.escrow.deposit(from: <-from)
			self.hasDepositedThisRound[depositor] = true
		}

		access(all) fun canPayout(): Bool {
			if self.members.length != Int(self.maxMembers) { return false }
			var allDeposited: Bool = true
			for m in self.members {
				if self.hasDepositedThisRound[m] != true {
					allDeposited = false
					break
				}
			}
			return allDeposited
		}

		access(all) fun nextPayoutAddress(): Address? {
			if self.currentRound >= self.totalRounds { return nil }
			let idx: Int = Int(self.currentRound)
			return self.members[idx]
		}

		access(all) fun payout() {
			pre {
				self.canPayout(): "All members must deposit before payout"
			}
			let recipientOpt = self.nextPayoutAddress()
			pre { recipientOpt != nil: "No recipient for this round" }
			let recipient = recipientOpt!

			let receiverRef = getAccount(recipient)
				.getCapability(MicroSavingsCircles.FlowTokenReceiverPublicPath)
				.borrow<&{FungibleToken.Receiver}>()
			pre { receiverRef != nil: "Recipient has no FlowToken receiver capability" }

			let payoutVault <- self.escrow.withdrawAll()
			receiverRef!.deposit(from: <-payoutVault)

			self.payoutHistory.append(recipient)
			self.hasReceivedPayout[recipient] = true
			self.currentRound = self.currentRound + 1 as UInt8

			self.hasDepositedThisRound = {}
		}

		access(all) fun asView(): MicroSavingsCircles.CircleView {
			return MicroSavingsCircles.CircleView(
				circleId: self.circleId,
				poolSize: self.poolSize,
				members: self.members,
				maxMembers: self.maxMembers,
				totalRounds: self.totalRounds,
				currentRound: self.currentRound,
				payoutHistory: self.payoutHistory,
				currentRoundDeposited: self.hasDepositedThisRound
			)
		}

		destroy() {
			destroy self.escrow
		}
	}

	access(all) var circles: {UInt64: @Circle}
	access(all) var nextCircleId: UInt64

	access(all) fun createCircle(poolSize: UFix64, maxMembers: UInt8): UInt64 {
		let id = self.nextCircleId
		self.circles[id] <-! create Circle(circleId: id, poolSize: poolSize, maxMembers: maxMembers)
		self.nextCircleId = self.nextCircleId + 1
		return id
	}

	access(all) fun joinCircle(circleId: UInt64, member: Address) {
		let circle <- self.circles.remove(key: circleId)
			?? panic("Circle not found")
		circle.join(member: member)
		self.circles[circleId] <-! circle
	}

	access(all) fun deposit(circleId: UInt64, from: @FungibleToken.Vault, depositor: Address) {
		let circle <- self.circles.remove(key: circleId)
			?? panic("Circle not found")
		circle.deposit(from: <-from, depositor: depositor)
		self.circles[circleId] <-! circle
	}

	access(all) fun payout(circleId: UInt64) {
		let circle <- self.circles.remove(key: circleId)
			?? panic("Circle not found")
		circle.payout()
		self.circles[circleId] <-! circle
	}

	access(all) fun checkStatus(circleId: UInt64): CircleView {
		let ref = &self.circles[circleId] as &Circle
		return ref.asView()
	}

	init() {
		self.FlowTokenReceiverPublicPath = /access(all)lic/flowTokenReceiver
		self.circles = {}
		self.nextCircleId = 1
	}
}
