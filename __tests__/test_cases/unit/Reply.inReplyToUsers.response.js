const given = require('../../steps/given')
const when = require('../../steps/when')
const chance = require('chance').Chance()
const path = require('path')

describe('Reply.inReplyToUsers.response template', () => {
    it('should set __typename on every user in the result ', () => {
        const templatePath = path.resolve(__dirname, '../../../mapping-templates/Reply.inReplyToUsers.response.vtl')
        const username1 = chance.guid()
        const username2 = chance.guid()
        // const data = {
        //     ['${UsersTable}']: [{
        //         id: username1
        //     }, {
        //         id: username2
        //     }]
        // }
        // const context = given.an_appsync_context({ username: username1 }, {}, {data})
        // const result = when.we_invoke_an_appsync_template(templatePath, context)

        // expect(result).toEqual([{
        //     id: username1,
        //     __typename: "MyProfile"
        // }, {
        //     id: username2,
        //     __typename: 'OtherProfile'
        // }])
    })
})