Cypress.Commands.add('resetTestData', () => cy.task('db:reset'))

Cypress.Commands.add('createScenario', (name, overrides = {}) =>
  cy.task('db:scenario', { name, overrides })
)

Cypress.Commands.add('loginByCredentials', (user) => {
  const cacheKey = [user.id, user.email, user.sessionEpoch || 0]
  cy.session(cacheKey, () => {
    cy.request('/api/auth/csrf').then(({ body }) => {
      cy.request({
        method: 'POST',
        url: '/api/auth/callback/credentials',
        form: true,
        followRedirect: false,
        body: {
          csrfToken: body.csrfToken,
          email: user.email,
          password: user.password,
          callbackUrl: '/en/dashboard',
          json: 'true',
        },
      }).its('status').should('be.oneOf', [200, 302])
    })
    cy.request('/api/auth/session').its('body.user.email').should('eq', user.email)
  })
})

Cypress.Commands.add('apiRequest', ({ actor, ...options }) => {
  if (!actor) return cy.request(options)
  cy.loginByCredentials(actor)
  return cy.request(options)
})
