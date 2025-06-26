# Contributing to Form Validation

Thank you for your interest in contributing to Form Validation. Here’s how you can help. 

This guide will help you set up your development environment, follow best practices, and submit high-quality pull requests.

Please take a few minutes to read through the instructions below to ensure a smooth collaboration process.

## Setting Up Your Fork and Naming Your Branch

### Fork and Clone the Repository

1. **Fork the repository**
  - Go to the [`form-validation` GitHub repo](https://github.com/ltvco/form-validation) page.
  - Click the **Fork** button at the top-right of the page.
  - Select your personal GitHub account as the destination.
  - **Uncheck** the box to keep all branches in sync, not just the main branch. 
  - Click **Create fork**.

2. **Clone your fork using SSH**

    Replace your-username with your GitHub username:

    ```bash
    git clone git@github.com:your-username/form-validation.git
    ```

3. **Add the original repository as an upstream remote**
  
    This allows you to sync your fork with the latest changes from the original repo:

    ```bash
    git remote add upstream https://github.com/ltvco/form-validation
    git remote -v
    ```

    You should see something like:

    ```text
    origin    git@github.com:your-username/form-validation.git (fetch)
    origin    git@github.com:your-username/form-validation.git (push)
    upstream  https://github.com/ltvco/form-validation (fetch)
    upstream  https://github.com/ltvco/form-validation (push)
    ```

### Create a Branch

Before making any changes, always create a new branch off main. This keeps your work isolated and easier to review and merge.

```bash
git checkout main
git pull upstream main
git checkout -b your-branch-name
```

#### Branch Naming Best Practices

Use concise, descriptive branch names that follow this format:

```text
<type>_<short-description>
```

Where:

- `type` describes the kind of change:
  - `fix` — for bug fixes
  - `feat` — for new features
  - `chore` — for maintenance or tooling updates
  - `docs` — for documentation updates
  - `test` — for adding or updating tests
  - `refactor` — for internal code changes that don’t affect behavior
- `short-description` gives a brief but meaningful summary of the change (use dashes - to separate words).

Examples:

- `fix_button-alignment`
- `feat_add-password-validation`
- `docs_update-readme`
- `refactor_form-handler`
- `chore_update-eslint-config`

Tips:

- Use lowercase.
- Avoid long branch names.
- Be specific but not overly detailed.