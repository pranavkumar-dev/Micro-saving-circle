access(all) contract MicroSavingsCircles {
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

    access(self) var circleData: {UInt64: CircleView}
    access(self) var nextCircleId: UInt64

    init() {
        self.FlowTokenReceiverPublicPath = /public/flowTokenReceiver
        self.circleData = {}
        self.nextCircleId = 1
    }

    access(all) fun createCircle(poolSize: UFix64, maxMembers: UInt8) {
        let circleId = self.nextCircleId
        self.nextCircleId = self.nextCircleId + 1

        let circleView = CircleView(
            circleId: circleId,
            poolSize: poolSize,
            members: [],
            maxMembers: maxMembers,
            totalRounds: maxMembers,
            currentRound: 1,
            payoutHistory: [],
            currentRoundDeposited: {}
        )
        self.circleData[circleId] = circleView
    }

    access(all) fun joinCircle(circleId: UInt64, member: Address) {
        // Simple implementation for now
    }

    access(all) fun deposit(circleId: UInt64, depositor: Address) {
        // Simple implementation for now
    }

    access(all) fun payout(circleId: UInt64) {
        // Simple implementation for now
    }

    access(all) fun checkStatus(circleId: UInt64): CircleView? {
        return self.circleData[circleId]
    }
}