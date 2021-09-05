require('dotenv').config()
const given = require('../../steps/given')
const when = require('../../steps/when')
const chance = require('chance').Chance()

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
    })
})