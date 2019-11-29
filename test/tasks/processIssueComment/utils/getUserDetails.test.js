const nock = require('nock')

const getUserDetails = require('../../../../src/tasks/processIssueComment/utils/getUserDetails')
const {
    UserNotFoundError,
} = require('../../../../src/tasks/processIssueComment/utils/errors')

const { rejectionOf } = require('../../../testUtils')
const mockUserAPIReturn = require('../../../fixtures/users.getByUsername.jakebolam.json')
const mockGithub = require('../../../mocks/mockGithub')

describe('Get User Details', () => {
    test('gets user details when user exists', async () => {
        const mockUser = 'jakebolam'

        nock('https://api.github.com')
            .get(`/users/${mockUser}`)
            .reply(200, mockUserAPIReturn)

        const details = await getUserDetails({
            github: mockGithub,
            username: mockUser,
        })
        expect(details).toMatchSnapshot()
    })

    test('throws error when user does not exists', async () => {
        const mockNoUser = 'no-such-user'

        nock('https://api.github.com')
            .get(`/users/${mockNoUser}`)
            .reply(404, {
                message: 'Not Found',
                documentation_url:
                    'https://developer.github.com/v3/users/#get-a-single-user',
            })

        const error = await rejectionOf(
            getUserDetails({ github: mockGithub, username: mockNoUser }),
        )
        expect(error instanceof UserNotFoundError).toBeTruthy()
        expect(error.message).toMatchSnapshot()
    })

    test('throws error on 500', async () => {
        const mockUser = 'mock-user'

        nock('https://api.github.com')
            .get(`/users/${mockUser}`)
            .reply(500)

        const error = await rejectionOf(
            getUserDetails({ github: mockGithub, username: mockUser }),
        )
        expect(error instanceof Error).toBeTruthy()
    })
})
