Feature: Hello world
  Display hello world on home page

  Scenario: Display hello world on home page
    Given I am on Home page
    When I do nothing
    Then Hello world is displayed on home page
