# Devin lab: Ask Devin for a plan, then approve it

**What it shows:** Devin reads the code and posts a plan that lists the files and tests it will touch. It waits. You reply **Approved** (or ask for a change), and only then does it write code and open a pull request.

**Needs:** GitHub and a Devin account. Everything happens in your browser.

**Time:** about 30 minutes.

## The task

This repo is a small invoices app. The finance team wants to download invoices as a CSV file.
The request is in [docs/feature-request-csv-export.md](docs/feature-request-csv-export.md).

The feature does not exist yet. Today the URL returns an error:

```console
$ curl -i http://localhost:3000/api/invoices/export.csv
HTTP/1.1 404 Not Found

{"error":"Invoice not found: export.csv"}
```

The change touches several files: the routes, a new CSV helper, the web page, the tests and the README.
That is why it is a good task to plan first.

## Set it up

1. On this repo's GitHub page, click **Use this template**, then **Create a new repository**. Choose your account as the owner, keep the name `devin-demo-plan-first`, and click **Create repository**. Use the template, not a fork: pull requests on a fork go to the original repo.
2. In Devin, open [**Settings → Connections → GitHub**](https://app.devin.ai/settings/connections/github) and make sure Devin can access the new repository.
3. Optional: open `docs/feature-request-csv-export.md` in your copy and read it, so you can check Devin's plan against it.

## Run it

1. Open [app.devin.ai](https://app.devin.ai), start a new session, and paste the prompt below. Replace `<you>` with your GitHub user.
2. Wait for the plan. Devin reads the code, runs the tests and posts a plan in the chat. Then it stops and waits for you. This takes about 5 minutes.
3. Read the plan. Check that it lists the files, the tests, and anything it found unclear.
4. Reply in the chat. Type `Approved` and press Enter. Or ask for a change first, for example: `Approved, but also add a paid_at column after status.` If you ask for a change, Devin posts an updated plan and waits again. Reply `Approved` when you are happy with it.
5. Wait for the pull request. Devin builds the plan, runs the tests and opens a pull request on your copy. The **Tests** check runs on the pull request in GitHub Actions.

## Prompt

```text
In https://github.com/<you>/devin-demo-plan-first, add the CSV export described in docs/feature-request-csv-export.md.

Work in two phases.

Phase 1: plan only. Read the code and the feature request, and run npm test. Then post a plan in this chat with:
- each file you will add or change, and what will change in it
- each test you will add or change, and what it checks
- anything in the request that is unclear or risky, and what you suggest
Then stop and wait for my reply. Do not write code, create a branch or open a pull request until I reply "Approved". If I ask for changes, post an updated plan and wait again.

Phase 2: after I reply "Approved", build exactly the approved plan. Run npm test and make sure every test passes. Open one pull request. In its description, list the files you changed, how you tested the change, and the first few lines of a sample CSV export.
```

## What to watch

- Devin posts the plan and then stops. No branch and no pull request appear until you reply.
- The plan names real files, like `src/app.js`. A good plan notices that the existing `/api/invoices/:id` route would catch `export.csv` first.

## You're done when

- You approved the plan (or asked for a change) in the chat.
- The pull request only touches the files from the approved plan, and the **Tests** check is green.
