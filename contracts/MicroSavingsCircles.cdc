import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x7e60df042a9c0868

access(all) contract MicroSavingsCircles {
    
    // ===== EVENTS =====
    access(all) event CircleCreated(circleId: UInt64, creator: Address, poolSize: UFix64, maxMembers: UInt8)
    access(all) event MemberJoined(circleId: UInt64, member: Address)
    access(all) event DepositMade(circleId: UInt64, member: Address, amount: UFix64, round: UInt8)
    access(all) event PayoutExecuted(circleId: UInt64, winner: Address, amount: UFix64, round: UInt8)
    access(all) event CircleCompleted(circleId: UInt64)
    access(all) event MemberRemoved(circleId: UInt64, member: Address, reason: String)

    // ===== ENUMS =====
    access(all) enum CircleStatus {
        access(all) case OPEN
        access(all) case FULL
        access(all) case IN_PROGRESS
        access(all) case COMPLETED
        access(all) case CANCELLED
    }

    // ===== STRUCTS =====
    access(all) struct CircleView {
        access(all) let circleId: UInt64
        access(all) let creator: Address
        access(all) let poolSize: UFix64
        access(all) let members: [Address]
        access(all) let maxMembers: UInt8
        access(all) let totalRounds: UInt8
        access(all) let currentRound: UInt8
        access(all) let payoutHistory: [Address?]
        access(all) let currentRoundDeposited: {Address: Bool}
        access(all) let status: CircleStatus
        access(all) let createdAt: UFix64
        access(all) let lastActivity: UFix64

        init(
            circleId: UInt64,
            creator: Address,
            poolSize: UFix64,
            members: [Address],
            maxMembers: UInt8,
            totalRounds: UInt8,
            currentRound: UInt8,
            payoutHistory: [Address?],
            currentRoundDeposited: {Address: Bool},
            status: CircleStatus,
            createdAt: UFix64,
            lastActivity: UFix64
        ) {
            self.circleId = circleId
            self.creator = creator
            self.poolSize = poolSize
            self.members = members
            self.maxMembers = maxMembers
            self.totalRounds = totalRounds
            self.currentRound = currentRound
            self.payoutHistory = payoutHistory
            self.currentRoundDeposited = currentRoundDeposited
            self.status = status
            self.createdAt = createdAt
            self.lastActivity = lastActivity
        }
    }

    access(all) struct MemberInfo {
        access(all) let address: Address
        access(all) let joinedAt: UFix64
        access(all) let totalDeposited: UFix64
        access(all) let roundsPaid: UInt8
        access(all) let hasReceivedPayout: Bool

        init(address: Address, joinedAt: UFix64) {
            self.address = address
            self.joinedAt = joinedAt
            self.totalDeposited = 0.0
            self.roundsPaid = 0
            self.hasReceivedPayout = false
        }
    }

    // ===== STORAGE =====
    access(self) var circleData: {UInt64: CircleView}
    access(self) var memberData: {UInt64: {Address: MemberInfo}}
    access(self) var nextCircleId: UInt64
    access(self) var totalCircles: UInt64
    access(self) var totalMembers: UInt64
    access(self) var totalVolume: UFix64

    // ===== INITIALIZATION =====
    init() {
        self.circleData = {}
        self.memberData = {}
        self.nextCircleId = 1
        self.totalCircles = 0
        self.totalMembers = 0
        self.totalVolume = 0.0
    }

    // ===== CORE FUNCTIONS =====
    
    /// Creates a new savings circle
    access(all) fun createCircle(poolSize: UFix64, maxMembers: UInt8): UInt64 {
        // Validation
        pre {
            poolSize > 0.0: "Pool size must be greater than 0"
            maxMembers >= 3: "Minimum 3 members required"
            maxMembers <= 20: "Maximum 20 members allowed"
        }

        let circleId = self.nextCircleId
        self.nextCircleId = self.nextCircleId + 1
        self.totalCircles = self.totalCircles + 1

        let currentTime = getCurrentBlock().timestamp
        let circleView = CircleView(
            circleId: circleId,
            creator: self.account.address,
            poolSize: poolSize,
            members: [],
            maxMembers: maxMembers,
            totalRounds: maxMembers,
            currentRound: 1,
            payoutHistory: [],
            currentRoundDeposited: {},
            status: CircleStatus.OPEN,
            createdAt: currentTime,
            lastActivity: currentTime
        )

        self.circleData[circleId] = circleView
        self.memberData[circleId] = {}

        emit CircleCreated(circleId: circleId, creator: self.account.address, poolSize: poolSize, maxMembers: maxMembers)
        
        return circleId
    }

    /// Allows a member to join an existing circle
    access(all) fun joinCircle(circleId: UInt64, member: Address) {
        pre {
            self.circleData[circleId] != nil: "Circle does not exist"
            self.memberData[circleId] != nil: "Circle member data not initialized"
        }

        let circle = &self.circleData[circleId] as &CircleView
        let members = &self.memberData[circleId] as &{Address: MemberInfo}

        // Validation
        pre {
            circle.status == CircleStatus.OPEN: "Circle is not open for new members"
            circle.members.length < circle.maxMembers: "Circle is full"
            !self.isMemberInCircle(circleId: circleId, member: member): "Member already in circle"
        }

        // Add member to circle
        let currentTime = getCurrentBlock().timestamp
        let memberInfo = MemberInfo(address: member, joinedAt: currentTime)
        members[member] = memberInfo

        // Update circle data
        let updatedMembers = circle.members
        updatedMembers.append(member)
        
        let updatedCircle = CircleView(
            circleId: circleId,
            creator: circle.creator,
            poolSize: circle.poolSize,
            members: updatedMembers,
            maxMembers: circle.maxMembers,
            totalRounds: circle.totalRounds,
            currentRound: circle.currentRound,
            payoutHistory: circle.payoutHistory,
            currentRoundDeposited: circle.currentRoundDeposited,
            status: updatedMembers.length == circle.maxMembers ? CircleStatus.FULL : CircleStatus.OPEN,
            createdAt: circle.createdAt,
            lastActivity: currentTime
        )

        self.circleData[circleId] = updatedCircle
        self.totalMembers = self.totalMembers + 1

        emit MemberJoined(circleId: circleId, member: member)
    }

    /// Allows a member to make a deposit for the current round
    access(all) fun deposit(circleId: UInt64, depositor: Address, amount: UFix64) {
        pre {
            self.circleData[circleId] != nil: "Circle does not exist"
            self.memberData[circleId] != nil: "Circle member data not initialized"
        }

        let circle = &self.circleData[circleId] as &CircleView
        let members = &self.memberData[circleId] as &{Address: MemberInfo}

        // Validation
        pre {
            circle.status == CircleStatus.FULL || circle.status == CircleStatus.IN_PROGRESS: "Circle is not active"
            self.isMemberInCircle(circleId: circleId, member: depositor): "Not a member of this circle"
            amount == circle.poolSize: "Deposit amount must match pool size"
            !circle.currentRoundDeposited[depositor]!: "Already deposited for this round"
        }

        // Transfer Flow tokens
        let vault = self.account.getCapability(/public/flowTokenReceiver)
            .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow Flow token receiver capability")

        let tempVault <- FlowToken.createEmptyVault()
        tempVault.deposit(from: <-vault.withdraw(amount: amount))
        
        // Update member data
        let memberInfo = members[depositor]!
        let updatedMemberInfo = MemberInfo(
            address: memberInfo.address,
            joinedAt: memberInfo.joinedAt,
            totalDeposited: memberInfo.totalDeposited + amount,
            roundsPaid: memberInfo.roundsPaid + 1,
            hasReceivedPayout: memberInfo.hasReceivedPayout
        )
        members[depositor] = updatedMemberInfo

        // Update circle data
        var updatedDeposited = circle.currentRoundDeposited
        updatedDeposited[depositor] = true

        let currentTime = getCurrentBlock().timestamp
        let updatedCircle = CircleView(
            circleId: circleId,
            creator: circle.creator,
            poolSize: circle.poolSize,
            members: circle.members,
            maxMembers: circle.maxMembers,
            totalRounds: circle.totalRounds,
            currentRound: circle.currentRound,
            payoutHistory: circle.payoutHistory,
            currentRoundDeposited: updatedDeposited,
            status: CircleStatus.IN_PROGRESS,
            createdAt: circle.createdAt,
            lastActivity: currentTime
        )

        self.circleData[circleId] = updatedCircle
        self.totalVolume = self.totalVolume + amount

        emit DepositMade(circleId: circleId, member: depositor, amount: amount, round: circle.currentRound)

        // Clean up temporary vault
        destroy tempVault
    }

    /// Executes payout for the current round
    access(all) fun payout(circleId: UInt64) {
        pre {
            self.circleData[circleId] != nil: "Circle does not exist"
        }

        let circle = &self.circleData[circleId] as &CircleView

        // Validation
        pre {
            circle.status == CircleStatus.IN_PROGRESS: "Circle is not in progress"
            self.allMembersDeposited(circleId: circleId): "Not all members have deposited"
        }

        // Select winner (round-robin based on current round)
        let winnerIndex = (circle.currentRound - 1) % circle.members.length
        let winner = circle.members[winnerIndex]

        // Calculate payout amount
        let payoutAmount = circle.poolSize * UFix64(circle.members.length)

        // Transfer payout to winner
        let vault = self.account.getCapability(/public/flowTokenReceiver)
            .borrow<&FlowToken.Vault{FungibleToken.Provider}>()
            ?? panic("Could not borrow Flow token provider capability")

        let winnerReceiver = getAccount(winner).getCapability(/public/flowTokenReceiver)
            .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow winner's Flow token receiver capability")

        winnerReceiver.deposit(from: <-vault.withdraw(amount: payoutAmount))

        // Update member data
        let members = &self.memberData[circleId] as &{Address: MemberInfo}
        let winnerInfo = members[winner]!
        let updatedWinnerInfo = MemberInfo(
            address: winnerInfo.address,
            joinedAt: winnerInfo.joinedAt,
            totalDeposited: winnerInfo.totalDeposited,
            roundsPaid: winnerInfo.roundsPaid,
            hasReceivedPayout: true
        )
        members[winner] = updatedWinnerInfo

        // Update circle data
        var updatedPayoutHistory = circle.payoutHistory
        updatedPayoutHistory.append(winner)

        let nextRound = circle.currentRound + 1
        let isCompleted = nextRound > circle.totalRounds

        let currentTime = getCurrentBlock().timestamp
        let updatedCircle = CircleView(
            circleId: circleId,
            creator: circle.creator,
            poolSize: circle.poolSize,
            members: circle.members,
            maxMembers: circle.maxMembers,
            totalRounds: circle.totalRounds,
            currentRound: nextRound,
            payoutHistory: updatedPayoutHistory,
            currentRoundDeposited: {},
            status: isCompleted ? CircleStatus.COMPLETED : CircleStatus.FULL,
            createdAt: circle.createdAt,
            lastActivity: currentTime
        )

        self.circleData[circleId] = updatedCircle

        emit PayoutExecuted(circleId: circleId, winner: winner, amount: payoutAmount, round: circle.currentRound)

        if isCompleted {
            emit CircleCompleted(circleId: circleId)
        }
    }

    // ===== VIEW FUNCTIONS =====

    /// Returns circle information
    access(all) fun checkStatus(circleId: UInt64): CircleView? {
        return self.circleData[circleId]
    }

    /// Returns all circles
    access(all) fun getAllCircles(): [CircleView] {
        var circles: [CircleView] = []
        for circleId in self.circleData.keys {
            circles.append(self.circleData[circleId]!)
        }
        return circles
    }

    /// Returns circles by status
    access(all) fun getCirclesByStatus(status: CircleStatus): [CircleView] {
        var circles: [CircleView] = []
        for circleId in self.circleData.keys {
            let circle = self.circleData[circleId]!
            if circle.status == status {
                circles.append(circle)
            }
        }
        return circles
    }

    /// Returns member information for a circle
    access(all) fun getMemberInfo(circleId: UInt64, member: Address): MemberInfo? {
        return self.memberData[circleId]?[member]
    }

    /// Returns platform statistics
    access(all) fun getPlatformStats(): {String: UInt64} {
        return {
            "totalCircles": self.totalCircles,
            "totalMembers": self.totalMembers,
            "totalVolume": self.totalVolume
        }
    }

    // ===== HELPER FUNCTIONS =====

    /// Checks if a member is in a circle
    access(all) fun isMemberInCircle(circleId: UInt64, member: Address): Bool {
        if let circle = self.circleData[circleId] {
            return circle.members.contains(member)
        }
        return false
    }

    /// Checks if all members have deposited for current round
    access(all) fun allMembersDeposited(circleId: UInt64): Bool {
        if let circle = self.circleData[circleId] {
            for member in circle.members {
                if !circle.currentRoundDeposited[member]! {
                    return false
                }
            }
            return true
        }
        return false
    }

    /// Returns the number of members who have deposited for current round
    access(all) fun getDepositedCount(circleId: UInt64): UInt8 {
        if let circle = self.circleData[circleId] {
            var count: UInt8 = 0
            for member in circle.members {
                if circle.currentRoundDeposited[member]! {
                    count = count + 1
                }
            }
            return count
        }
        return 0
    }

    // ===== ADMIN FUNCTIONS =====

    /// Emergency function to cancel a circle (only creator can call)
    access(all) fun cancelCircle(circleId: UInt64) {
        pre {
            self.circleData[circleId] != nil: "Circle does not exist"
        }

        let circle = &self.circleData[circleId] as &CircleView
        pre {
            circle.creator == self.account.address: "Only circle creator can cancel"
            circle.status == CircleStatus.OPEN || circle.status == CircleStatus.FULL: "Cannot cancel active circle"
        }

        let currentTime = getCurrentBlock().timestamp
        let updatedCircle = CircleView(
            circleId: circleId,
            creator: circle.creator,
            poolSize: circle.poolSize,
            members: circle.members,
            maxMembers: circle.maxMembers,
            totalRounds: circle.totalRounds,
            currentRound: circle.currentRound,
            payoutHistory: circle.payoutHistory,
            currentRoundDeposited: circle.currentRoundDeposited,
            status: CircleStatus.CANCELLED,
            createdAt: circle.createdAt,
            lastActivity: currentTime
        )

        self.circleData[circleId] = updatedCircle
    }

    /// Removes a member from a circle (only creator can call)
    access(all) fun removeMember(circleId: UInt64, member: Address, reason: String) {
        pre {
            self.circleData[circleId] != nil: "Circle does not exist"
            self.memberData[circleId] != nil: "Circle member data not initialized"
        }

        let circle = &self.circleData[circleId] as &CircleView
        let members = &self.memberData[circleId] as &{Address: MemberInfo}

        pre {
            circle.creator == self.account.address: "Only circle creator can remove members"
            circle.status == CircleStatus.OPEN || circle.status == CircleStatus.FULL: "Cannot remove from active circle"
            self.isMemberInCircle(circleId: circleId, member: member): "Member not in circle"
        }

        // Remove member from circle
        var updatedMembers = circle.members
        var index = 0
        for i in 0..<updatedMembers.length {
            if updatedMembers[i] == member {
                index = i
                break
            }
        }
        updatedMembers.remove(at: index)

        // Remove member data
        members.remove(key: member)

        let currentTime = getCurrentBlock().timestamp
        let updatedCircle = CircleView(
            circleId: circleId,
            creator: circle.creator,
            poolSize: circle.poolSize,
            members: updatedMembers,
            maxMembers: circle.maxMembers,
            totalRounds: circle.totalRounds,
            currentRound: circle.currentRound,
            payoutHistory: circle.payoutHistory,
            currentRoundDeposited: circle.currentRoundDeposited,
            status: CircleStatus.OPEN,
            createdAt: circle.createdAt,
            lastActivity: currentTime
        )

        self.circleData[circleId] = updatedCircle
        self.totalMembers = self.totalMembers - 1

        emit MemberRemoved(circleId: circleId, member: member, reason: reason)
    }
}