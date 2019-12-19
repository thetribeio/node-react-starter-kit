Feature: Hello world
  Display hello world on home page

  Scenario: Display hello world on home page
    Given I am on Home page
    When I press the button
    Then "You clicked 1 time" is displayed in Home page
