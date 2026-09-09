# Code à Cuisine

A web app that turns the ingredients you already have into an AI-generated
recipe. Every generated recipe is stored in Firebase and browsable
afterwards in a public library. Built as the submission project for a
coding bootcamp.

**Live demo:** _(added once deployed)_

## Stack

- Angular 22, standalone components, zoneless, no SSR
- TypeScript, SCSS (7-1 structure)
- Firebase Realtime Database for storing generated recipes
- n8n workflows for the AI recipe generation, called via webhook

## Setup

```bash
npm install
npm start
```

Runs on `http://localhost:4200`.

## Scripts

- `npm start` — dev server (`ng serve`)
- `npm run build` — production build (`ng build`)
- `npm run watch` — build in watch mode, development configuration

No test scripts — this project deliberately ships without a test setup.

## Planned structure

- `src/app/pages/generator` — enter ingredients, trigger recipe generation
- `src/app/pages/library` — public list of all generated recipes
- `src/app/pages/recipe-detail` — a single recipe
- `src/app/pages/imprint` — legal imprint
- `src/app/components` — shared UI building blocks
- `src/app/core` — services and other app-wide building blocks
- `n8n/` — exported n8n workflow JSONs that generate recipes
