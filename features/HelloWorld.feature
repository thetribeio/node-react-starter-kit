Feature: Hello world
  Display hello world on home page

  Scenario: Display hello world on home page
    Given I am on Home page
    When I press "click-me"
    Then "You clicked 1 times" is displayed within "click-me"
