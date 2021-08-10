const DynamoDB = require('aws-sdk/clients/dynamodb')
const DocumentClient = new DynamoDB.DocumentClient()
const ulid = require('ulid')
const { TweetTypes } = require('../lib/constants')
const { USERS_TABLE, TWEETS_TABLE, TIMELINES_TABLE } = process.env
const { getTweetById } = require('../lib/tweets')
const _ = require('lodash')

module.exports.handler = async (event) => {
    const { tweetId, text } = event.arguments
    const { username } = event.identity
    const id = ulid.ulid()
    const timestamp = new Date().toJSON()

    const tweet = getTweetById(tweetId)
    if (!tweet) {
        throw new Error('Tweet is not found')
    }

    const inReplyToUserIds = await getUserIdsToReplyTo(tweet)

    const newTweet = {
        __typename: TweetTypes.REPLY,
        id,
        creator: username,
        createdAt: timestamp,
        retweetOf: tweetId,
        inReplyToTweetId: tweetId,
        inReplyToUserIds,
        text,
        replies: 0,
        likes: 0,
        retweets: 0 
    }

    const transactItems = [{
            Put: {
                TableName: TWEETS_TABLE,
                Item: newTweet
            },
        },
        {
            Update: {
                TableName: USERS_TABLE,
                Key: {
                    id: username
                },
                UpdateExpression: 'ADD tweetsCount :one',
                ExpressionAttributeValues: {
                    ':one': 1
                },
                ConditionExpression: 'attribute_exists(id)'
            }
        },
        {
            Update: {
                TableName: TWEETS_TABLE,
                Key: {
                    id: tweetId
                },
                UpdateExpression: 'ADD replies :one',
                ExpressionAttributeValues: {
                    ':one': 1
                },
                ConditionExpression: 'attribute_exists(id)'
            }
        },
        {
            Put: {
                TableName: TIMELINES_TABLE,
                Item: {
                    userId: username,
                    tweetId: id,
                    timestamp,
                    inReplyToTweetId: tweetId,
                    inReplyToUserIds
                }
            }
        }
    ]

    await DocumentClient.transactWrite({
        TransactItems: transactItems
    }).promise()

    return true
}

async function getUserIdsToReplyTo(tweet) {
    let userIds = [tweet.creator]
    if (tweet.__typename === TweetTypes.REPLY) {
        userIds = userIds.concat(tweet.inReplyToUserIds)
    } else if(tweet.__typename === TweetTypes.RETWEET) {
        const retweetOf = getTweetById(tweet.retweetOf)
        userIds = userIds.concat(await getUserIdsToReplyTo(retweetOf))
    }

    return _.uniq(userIds)
}