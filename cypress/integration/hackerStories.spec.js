describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  describe('Hiting the Real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0',
        }
      }).as('getStories')
      cy.intercept(
        'GET',
        '**/search?query=React&page=1')
        .as('getNextStories')

      cy.visit('/')
      cy.wait('@getStories')

    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.get('.item').should('have.length', 20)

      cy.contains('More').should('be.visible').click()
      cy.wait('@getNextStories')
      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept('GET', `**/search?query=${newTerm}&page=0`).as('getNewTermStories')
      cy.get('#search').should('be.visible').clear()
        .type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()
      cy.wait('@getStories')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('be.visible')
        .should('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })

  })

  describe('Mocking the API', () => {
    
    describe('Footer and the list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'stories'}
        ).as('getStories')
  
        cy.visit('/')
        cy.wait('@getStories')
  
      })
      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })
  
      context('List of stories', () => {
        const stories = require('../fixtures/stories')
        it('shows the right data for all rendered stories', () => { 
          cy.get('.item')
          .first()
          .should('be.visible')
          .should('contain', stories.hits[0].title)
          .and('contain', stories.hits[0].author)
          .and('contain', stories.hits[0].num_comments)
          .and('contain', stories.hits[0].points)
          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)
          
          cy.get('.item')
          .last()
          .should('be.visible')
          .should('contain', stories.hits[1].title)
          .and('contain', stories.hits[1].author)
          .and('contain', stories.hits[1].num_comments)
          .and('contain', stories.hits[1].points)
          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        
        })
  
        it('shows one less story after dimissing the first one', () => {
          cy.get('.button-small')
            .first()
            .should('be.visible')
            .click()
  
          cy.get('.item').should('have.length', 1)
        })

        context('Order by', () => {
          it('orders by title', () => { 
            cy.get('.list-header-button:contains(Title)')
              .should('be.visible') 
              .click()
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)
            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)
            
            cy.get('.list-header-button:contains(Title)')
              .should('be.visible')  
              .click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title)
            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)
          })

          it('orders by author', () => { 
            cy.get('.list-header-button:contains(Author)')
              .should('be.visible')
              .click()
            cy.get('.item')
              .first()
              .should('be.visible')
            
            cy.get('.list-header-button:contains(Author)')
              .should('be.visible')  
              .click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].author)
          })
  
          it('orders by comments', () => { 
            cy.get('.list-header-button:contains(Comments)')
              .should('be.visible')
              .click()
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments)
            
            cy.get('.list-header-button:contains(Comments)')
              .should('be.visible')  
              .click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments)
          })
  
          it('orders by points', () => { 
            cy.get('.list-header-button:contains(Points)')
              .should('be.visible')
              .click()
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].points)
            
            cy.get('.list-header-button:contains(Points)')
              .should('be.visible')  
              .click()
            
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)
          })
        })
      })
    });

    context('Search', () => {

      beforeEach(() => {
        cy.intercept('GET', `**/search?query=${initialTerm}&page=0`,
        { fixture: 'empty'}
        ).as('getEmptyStories')

        cy.intercept('GET', `**/search?query=${newTerm}&page=0`,
        { fixture: 'stories'}
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')

        cy.get('#search').should('be.visible').clear()

      })

      it('types and hits ENTER', () => {
        cy.get('#search').should('be.visible')
          .type(`${newTerm}{enter}`)

        cy.wait('@getStories')
        cy.get('.item').should('be.visible').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search')
          .should('be.visible')
          .type(newTerm)
        cy.contains('Submit')
          .should('be.visible')
          .click()

        cy.wait('@getStories')
        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      context('Last searches', () => {

        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')
          cy.intercept('GET', '**/search**', {fixture: 'empty'}).as('getRamdomSearch')
          Cypress._.times(6, () => {
            cy.get('#search')
              .should('be.visible')
              .clear()
              .type(`${faker.random.word()}{enter}`)
            cy.wait('@getRamdomSearch')
          })

          cy.get('.last-searches button')
            .should('be.visible')
            .should('have.length', 5)
        })
      })
      it('show no story when none is retorned ', () => {
        cy.get('.item').should('not.exist')
      });
    })
  });

  context('Errors', () => {
    const errorMsg = 'Oops! Tente novamente mais tarde.'
    it('shows "Something went wrong ..." in case of a server error', () => {
      cy.intercept(
        'GET',
        '**/search**',
        { statusCode: 500 }
      ).as('getServerFailure')

      cy.visit('/')

      cy.wait('@getServerFailure')
      cy.get('p:contains(Something went wrong ...)').should('be.visible')

    })
    it('shows "Something went wrong ..." in case of a network error', () => {
      cy.intercept(
        'GET',
        '**/search**',
        { forceNetworkError: true }
      ).as('getNetworkFailure')

      cy.visit('/')

      cy.wait('@getNetworkFailure')
      cy.get('p:contains(Something went wrong ...)').should('be.visible')

    })
  })
})