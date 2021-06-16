require('dotenv').config()
const given = require('../../steps/given')
const when = require('../../steps/when')
const then = require('../../steps/then')
const chance = require('chance').Chance()
const path = require('path')

describe('Given an authenticated user', () => {
    let user
    beforeAll(async () => {
        user = await given.an_authenticated_user()
    })

    describe('when he sends a tweet', () => {
        let tweet
        const text = chance.string({ length: 16 })
        beforeAll(async () => {
            tweet = await when.a_user_calls_tweet(user, text)
            console.log(`tweet =`, tweet)
        })

        it('Should return the new tweet', () => {
            expect(tweet).toMatchObject({
                text,
                replies: 0,
                likes: 0,
                retweets: 0,
                liked: false,
            })
        })

        describe('When he calls getTweets', () => {
            let tweets, nextToken
            beforeAll(async () => {
                const result = await when.a_user_calls_getTweet(user, user.username, 25)
                tweets = result.tweets
                nextToken = result.nextToken
            })


            it('He will see the new tweet in the tweets array', () => {
                expect(nextToken).toBeNull()
                expect(tweets.length).toEqual(1)
                expect(tweets[0]).toEqual(tweet)
            })
    
            it('he can not ask for more than 25 tweets in a page', async () => {
                await expect(when.a_user_calls_getTweet(user, user.username, 26))
                    .rejects
                    .toMatchObject({
                        message: expect.stringContaining('max limit is 25')
                })
            })
        })

        describe('When he calls getMyTimeline', () => {
            let tweets, nextToken
            beforeAll(async () => {
                const result = await when.a_user_calls_getMyTimeline(user, 25)
                tweets = result.tweets
                nextToken = result.nextToken
            })


            it('He will see the new tweet in the tweets array', () => {
                expect(nextToken).toBeNull()
                expect(tweets.length).toEqual(1)
                expect(tweets[0]).toEqual(tweet)
            })
    
            it('he can not ask for more than 25 tweets in a page', async () => {
                await expect(when.a_user_calls_getMyTimeline(user, 26))
                    .rejects
                    .toMatchObject({
                        message: expect.stringContaining('max limit is 25')
                })
            })
        })
    })
})