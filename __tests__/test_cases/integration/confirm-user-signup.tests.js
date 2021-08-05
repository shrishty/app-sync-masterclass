const given = require('../../steps/given')
const when = require('../../steps/when')
const then = require('../../steps/then')
const chance = require('chance').Chance()

describe('When Confirm User Signup runs', () => {
    it("The user's profile should be saved in dynamodb", async () => {
        const {name, email} = given.a_random_user()
        const username = chance.guid()

        await when.we_invoke_confirmUserSignup(username, name, email)

        const dbuser = await then.user_exists_in_UsersTable(username)
        expect(dbuser).toMatchObject({
            id: username,
            name,
            createdAt: expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g),
            followersCount: 0,
            followingCount: 0,
            likesCount: 0,
            tweetsCount: 0
        })

        const [firstName, lastName] = name.split(' ')
        expect(dbuser.screenName).toContain(firstName)
        expect(dbuser.screenName).toContain(lastName)
    })
})
