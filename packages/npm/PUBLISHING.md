# Publishing buzzdealer-ai to npm

Not published yet. These are the steps for Uri. Nothing here was run.

The package name `buzzdealer-ai` should be published from the npm account that belongs to the buzzdealer-ai GitHub org (the same owner as https://github.com/buzzdealer-ai/mcp), not from a personal account.

1. **Account.** Sign in at https://www.npmjs.com, or create the account for the buzzdealer-ai org there. Verify its email.
2. **Two-factor.** Account, Two-Factor Authentication: turn it on for "Authorization and writes" (auth-and-writes), with an authenticator app. Keep the recovery codes.
3. **Check the name is free.**
   ```
   npm view buzzdealer-ai
   ```
   A `404 Not Found` means it is free. If it shows a package, stop and tell the team.
4. **Sign in from the terminal.**
   ```
   npm login
   npm whoami
   ```
   `npm whoami` must print the org's npm user.
5. **Build and test** (from this folder, `packages/npm`):
   ```
   npm install
   npm run build && npm test
   ```
   All tests must pass.
6. **Look at what will be published.**
   ```
   npm pack --dry-run
   ```
   Expect `dist/`, `README.md`, `LICENSE` and `package.json` only.
7. **Publish** with the code from the authenticator app:
   ```
   npm publish --access public --otp=123456
   ```
   (Replace 123456 with the current code.)
8. **Check it.**
   ```
   npm view buzzdealer-ai
   npx buzzdealer-ai@latest help
   ```
   Also open https://www.npmjs.com/package/buzzdealer-ai and check the README, the licence and the repository link.
9. **Afterwards.** In the root README, change "not yet published" next to the npm package to the npm link.

For a later version: raise `"version"` in `package.json`, then steps 5 to 8 again.

A PyPI twin was not made.
