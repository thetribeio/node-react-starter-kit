Feature: Hello world
  Display hello world on home page

  Scenario: Display hello world on home page
    Given I am on Home page
    When I press the "You clicked 0 times" button
    Then "You clicked 1 time" is displayed in Home page

  Scenario: Translate content
    Given I am on Home page
    When I press the "Translate in fr" button
    Then "Vous avez cliqué 0 fois" is displayed in Home page
