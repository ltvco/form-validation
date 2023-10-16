# LTV Form-Validation

## How to use it

## Work in the library

### Initial Setup

### Create your fork

- Fork this [repository](https://github.com/ltvco/form-validation).
  - Clicking the fork button at the top right of the page.
    - Select your personal account as the owner for the fork.
    - Uncheck the checkbox to keep all the branches in sync not just the master branch.
    - Click the fork button.
- Go to your github account.
- Go to your repositories and clone you fork of `form-validation` repository using SSH.
  - Example: `git clone git@github.com:username/form-validation.git`
    - Username should be your github username.
- Once inside your working environment, open the repository in your IDE
- Add the upstream repository as a remote:
  - `git remote add upstream https://github.com/ltvco/form-validation`
    - Now upstream will refer to the original repository.
- Check that you have the remotes correctly configured:
  - `git remote -v`
  - You should see something like this (with your username):
    - `origin  git@github.com:KennethCalvo/form-validation.git (fetch)`
    - `origin  git@github.com:KennethCalvo/form-validation.git (push)`
    - `upstream https://github.com/ltvco/form-validation (fetch)`
    - `upstream https://github.com/ltvco/form-validation (push)`
      - Origin is your fork.
      - Upstream is the original repository.
