require('dotenv').config()
const given = require('../../steps/given')
const when = require('../../steps/when')
const chance = require('chance').Chance()

jest.setTimeout(10000)

describe('Given an authenticated users, userA, userB and userC', () => {
    let userA, userB, userC
    const text = chance.string({ length: 16 })
    beforeAll(async () => {
        userA = await given.an_authenticated_user()
        userB = await given.an_authenticated_user()
        userC = await given.an_authenticated_user()
        userAsTweet = await when.a_user_calls_tweet(userA, text)
    })

    describe("When userB replies to userA tweet", () => {
        let userBsReply
        const replyText = chance.string({ length: 16 })

        beforeAll(async () => {
            userBsReply = await when.a_user_calls_reply(userB, userAsTweet.id, replyText)
        })

        it('UserB should see his reply when he calls getTweet', async () => {
            const { tweets } = await when.a_user_calls_getTweets(userB, userB.username, 25)

            expect(tweets).toHaveLength(1)
            expect(tweets[0]).toMatchObject({
                profile: {
                    id: userB.username,
                    tweetsCount: 1
                },
                inReplyToTweet: {
                    id: userAsTweet.id,
                    replies: 1,
                },
                inReplyToUsers: [{
                    id: userA.username
                }]
            })
        })

        it('UserB should see the reply when he calls getMyTimeline', async () => {
            const { tweets } = await when.a_user_calls_getMyTimeline(userB, 25)

            expect(tweets).toHaveLength(1)
            expect(tweets[0]).toMatchObject({
                profile: {
                    id: userB.username,
                    tweetsCount: 1
                },
                inReplyToTweet: {
                    id: userAsTweet.id,
                    replies: 1,
                },
                inReplyToUsers: [{
                    id: userA.username
                }]
            })
        })

        describe("When userC replies to userC's reply", () => {
            let userCsReply
            const replyText = chance.string({ length: 16 })

            beforeAll(async () => {
                userCsReply = await when.a_user_calls_reply(userC, userBsReply.id, replyText)
            })

            it('UserC should see his reply when he calls getTweet', async () => {
                const { tweets } = await when.a_user_calls_getTweets(userC, userC.username, 25)

                expect(tweets).toHaveLength(1)
                expect(tweets[0]).toMatchObject({
                    profile: {
                        id: userC.username,
                        tweetsCount: 1
                    },
                    inReplyToTweet: {
                        id: userBsReply.id,
                        replies: 1,
                    },
                    inReplyToUsers: expect.arrayContaining([
                        expect.objectContaining({
                            id: userA.username,
                        }),
                        expect.objectContaining({
                            id: userB.username,
                        })
                    ])
                })
                expect(tweets[0].inReplyToUsers).toHaveLength(2)
            })

            it('UserC should see the reply when he calls getMyTimeline', async () => {
                const { tweets } = await when.a_user_calls_getMyTimeline(userC, 25)

                expect(tweets).toHaveLength(1)
                expect(tweets[0]).toMatchObject({
                    profile: {
                        id: userC.username,
                        tweetsCount: 1
                    },
                    inReplyToTweet: {
                        id: userBsReply.id,
                        replies: 1,
                    },
                    inReplyToUsers: expect.arrayContaining([
                        expect.objectContaining({
                            id: userA.username,
                        }),
                        expect.objectContaining({
                            id: userB.username,
                        })
                    ])
                })
                expect(tweets[0].inReplyToUsers).toHaveLength(2)
            })
        })
    })

    describe("When userC retweets UserA's tweet", () => {
        let userCsRetweet
        beforeAll(async () => {
            userCsRetweet = await when.a_user_calls_retweet(userC, userAsTweet.id)
        })

        describe("When userB replies to userC's retweet", () => {
            let userBsReply
            const replyText = chance.string({ length: 16 })

            beforeAll(async () => {
                userBsReply = await when.a_user_calls_reply(userB, userCsRetweet.id, replyText)
            })


            it('UserB should see his reply when he calls getTweet', async () => {
                const { tweets } = await when.a_user_calls_getTweets(userB, userB.username, 25)

                expect(tweets).toHaveLength(2)
                expect(tweets[0]).toMatchObject({
                    inReplyToTweet: {
                        id: userCsRetweet.id,
                    },
                    inReplyToUsers: expect.arrayContaining([
                        expect.objectContaining({
                            id: userA.username,
                        }),
                        expect.objectContaining({
                            id: userC.username,
                        })
                    ])
                })
                expect(tweets[0].inReplyToUsers).toHaveLength(2)
            })

            it('UserB should see the reply when he calls getMyTimeline', async () => {
                const { tweets } = await when.a_user_calls_getMyTimeline(userB, 25)

                expect(tweets).toHaveLength(2)
                expect(tweets[0]).toMatchObject({
                    inReplyToTweet: {
                        id: userCsRetweet.id,
                    },
                    inReplyToUsers: expect.arrayContaining([
                        expect.objectContaining({
                            id: userA.username,
                        }),
                        expect.objectContaining({
                            id: userB.username,
                        })
                    ])
                })
                expect(tweets[0].inReplyToUsers).toHaveLength(2)
            })
        })
    })
})