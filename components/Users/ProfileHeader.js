import { Query } from 'react-apollo'
import { css } from 'glamor'
import gql from 'graphql-tag'
import {
  colors,
  fontStyles,
  Loader,
  Interaction,
  A
} from '@project-r/styleguide'

import routes from '../../server/routes'
import { REPUBLIK_FRONTEND_URL } from '../../server/constants'

import { Section } from '../Display/utils'
const { Link } = routes

const styles = {
  header: css({
    position: 'sticky',
    top: -20,
    zIndex: 10,
    borderBottom: `1px solid ${colors.disabled}`
  }),
  byline: css({
    ...fontStyles.sansSerifRegular16
  }),
  portrait: css({
    float: 'left',
    height: '50px',
    marginRight: '10px'
  }),
  navLink: css({
    color: '#000',
    padding: '0 3px',
    textDecoration: 'none',
    '&[data-active="true"]': {
      textDecoration: 'underline'
    },
    marginRight: 5
  })
}

export const GET_PROFILE = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      firstName
      lastName
      email
      phoneNumber
      username
      portrait(size: SMALL)
    }
  }
`

const Subnav = ({ userId, section }) => (
  <div>
    <Link
      route='user'
      params={{
        userId
      }}
    >
      <a {...styles.navLink} data-active={section === 'index'}>
        Übersicht
      </a>
    </Link>
    <Link
      route='user'
      params={{
        userId,
        section: 'sessions'
      }}
    >
      <a
        {...styles.navLink}
        data-active={section === 'sessions'}
      >
        Sessions
      </a>
    </Link>
    <Link
      route='user'
      params={{
        userId,
        section: 'access-grants'
      }}
    >
      <a
        {...styles.navLink}
        data-active={section === 'access-grants'}
      >
        Access Grants
      </a>
    </Link>
    <Link
      route='user'
      params={{
        userId,
        section: 'maillog'
      }}
    >
      <a
        {...styles.navLink}
        data-active={section === 'maillog'}
      >
        E-Mails
      </a>
    </Link>
  </div>
)

export default ({ userId, section }) => {
  return (
    <Query query={GET_PROFILE} variables={{ id: userId }}>
      {({ loading, error, data }) => {
        const isInitialLoading =
          loading && !(data && data.user)
        return (
          <Loader
            loading={isInitialLoading}
            error={isInitialLoading && error}
            render={() => {
              const { user } = data
              const byline = [
                user.email && (
                  <A
                    key="mail"
                    href={`mailto:${user.email}`}
                  >
                    {user.email}
                  </A>
                ),
                user.phoneNumber && (
                  <A
                    key="phone"
                    href={`tel:${user.phoneNumber}`}
                  >
                    {user.phoneNumber}
                  </A>
                ),
                user.username && (
                  <span key="username">
                    <A key="profile" href={`${REPUBLIK_FRONTEND_URL}/~${user.username}`} target="_blank">
                      {user.username}
                    </A>
                  </span>
                )
              ]
                .filter(Boolean)
                .reduce((acc, v) => [...acc, ' | ', v], [])
                .slice(1)
              return (
                <Section {...styles.header}>
                  <div>
                    <img
                      src={user.portrait}
                      {...styles.portrait}
                    />
                    <Interaction.H3>
                      {user.firstName} {user.lastName}
                    </Interaction.H3>
                    <div {...styles.byline}>
                      {byline}
                    </div>
                  </div>
                  <div  style={{clear: 'both', margin: '10px 0'}}>
                    <Subnav
                    userId={userId}
                    section={section}
                    />
                    </div>
                </Section>
              )
            }}
          />
        )
      }}
    </Query>
  )
}
