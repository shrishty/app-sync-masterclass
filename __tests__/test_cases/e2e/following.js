require('dotenv').config()
const given = require('../../steps/given')
const when = require('../../steps/when')
const chance = require('chance').Chance()
const retry = require('async-retry')

jest.setTimeout(100000)

describe('Given an authenticated users, userA, userB and userC', () => {
    let userA, userB, userAsProfile, userBsProfile
    let userBsTweet1, userBsTweet2
    beforeAll(async () => {
        userA = await given.an_authenticated_user()
        userB = await given.an_authenticated_user()
        userAsProfile = await when.a_user_calls_getMyProfile(userA)
        userBsProfile = await when.a_user_calls_getMyProfile(userB)
        userBsTweet1 = await when.a_user_calls_tweet(userB, chance.paragraph())
        userBsTweet2 = await when.a_user_calls_tweet(userB, chance.paragraph())
    })

    describe("When userA follows userB", () => {
        beforeAll(async () => {
            await when.a_user_calls_follow(userA, userB.username)
        })

        it("User A should see following as true when viewing userB's profile", async () => {
            const { following, followedBy } = await when.a_user_calls_getProfile(userA, userBsProfile.screenName)
            expect(following).toBe(true)
            expect(followedBy).toBe(false)
        })

        it("User b should see following as true when viewing userA's profile", async () => {
            const { following, followedBy } = await when.a_user_calls_getProfile(userB, userAsProfile.screenName)
            expect(following).toBe(false)
            expect(followedBy).toBe(true)
        })

        it("UserA should see himself in userB's list of follwers", async () => {
            const { profiles } = await when.a_user_calls_getFollowers(userA, userB.username, 25)

            expect(profiles).toHaveLength(1)
            expect(profiles[0]).toMatchObject({
                id: userA.username
            })

            expect(profiles[0]).not.toHaveProperty('following')
            expect(profiles[0]).not.toHaveProperty('followedBy')
        })

        it("UserB should see userA in his list of followers", async () => {
            const { profiles } = await when.a_user_calls_getFollowers(userB, userB.username, 25)

            expect(profiles).toHaveLength(1)
            expect(profiles[0]).toMatchObject({
                id: userA.username,
                following: false,
                followedBy: true
            })
        })

        it("UserA should see userB in his list of following", async () => {
            const { profiles } = await when.a_user_calls_getFollowing(userA, userA.username, 25)

            expect(profiles).toHaveLength(1)
            expect(profiles[0]).toMatchObject({
                id: userB.username,
                following: true,
                followedBy: false
            })
        })

        it("UserB should see userA in his list of following", async () => {
            const { profiles } = await when.a_user_calls_getFollowing(userB, userB.username, 25)

            expect(profiles).toHaveLength(0)
        })

        it("Adds userB's tweets to userA's timeline", async () => {
            retry(async () => {
                const { tweets } = await when.a_user_calls_getMyTimeline(userA, 25)
                expect(tweets).toHaveLength(2)
                expect(tweets).toEqual([
                    expect.objectContaining({
                        id: userBsTweet2.id
                    }),
                    expect.objectContaining({
                        id: userBsTweet1.id
                    })
                ])
            }, {
                retries: 3,
                maxTimeout: 1000
            })

        })
    })

    describe("UserB sends a tweet", () => {
        let tweet
        const text = chance.string({ length: 16 })
        beforeAll(async () => {
            tweet = await when.a_user_calls_tweet(userB, text)
        })

        it("Should appear in userA's timeline", async () => {
            await retry(async () => {
                const { tweets } = await when.a_user_calls_getMyTimeline(userA, 25)
                expect(tweets).toHaveLength(3)
                expect(tweets[0].id).toEqual(tweet.id)
            }, {
                retries: 3,
                maxTimeout: 1000
            })

        })

    })

    describe("When userB follows userA back", () => {
        beforeAll(async () => {
            await when.a_user_calls_follow(userB, userA.username)
        })

        it("User A should see following and followed by as true when viewing userB's profile", async () => {
            const { following, followedBy } = await when.a_user_calls_getProfile(userA, userBsProfile.screenName)
            expect(following).toBe(true)
            expect(followedBy).toBe(true)
        })

        it("User b should see following and followed by as true when viewing userA's profile", async () => {
            const { following, followedBy } = await when.a_user_calls_getProfile(userB, userAsProfile.screenName)
            expect(following).toBe(true)
            expect(followedBy).toBe(true)
        })
    })

    describe("UserA sends a tweet", () => {
        let tweet
        const text = chance.string({ length: 16 })
        beforeAll(async () => {
            tweet = await when.a_user_calls_tweet(userB, text)
        })

        it("Should appear in userB's timeline", async () => {
            await retry(async () => {
                const { tweets } = await when.a_user_calls_getMyTimeline(userB, 25)
                expect(tweets).toHaveLength(4)
                expect(tweets[0].id).toEqual(tweet.id)
            }, {
                retries: 3,
                maxTimeout: 1000
            })

        })
    })

    describe("When userA unfollows userB", () => {
        beforeAll(async () => {
            await when.a_user_calls_unfollow(userA, userB.username)
        })

        it("User A should see following as false when viewing userB's profile", async () => {
            const { following, followedBy } = await when.a_user_calls_getProfile(userA, userBsProfile.screenName)
            expect(following).toBe(false)
            expect(followedBy).toBe(true)
        })

        it("User b should see following as true when viewing userA's profile", async () => {
            const { following, followedBy } = await when.a_user_calls_getProfile(userB, userAsProfile.screenName)
            expect(following).toBe(true)
            expect(followedBy).toBe(false)
        })

        it("Remove userB's tweets to userA's timeline", async () => {
            retry(async () => {
                const { tweets } = await when.a_user_calls_getMyTimeline(userA, 25)
                expect(tweets).toHaveLength(1)
                expect(tweets).toEqual([
                    expect.objectContaining({
                        profile: {
                            id: userA.username
                        }
                    })
                ])
            }, {
                retries: 3,
                maxTimeout: 10000
            })

        })
    })
})