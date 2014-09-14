moji-web
===

Repository to serve www.mojigram.com and api.mojigram.com.

Install
===
1. Install nvm through `http://github.com/creationix/nvm`

2. Get AWS access token from someone and copy to ~/.elasticbeanstalk/aws_credential_file. chmod 400 file.

3. Install postgres and run `npm run db:schema:development`

4. Try to run tests after uploading your own override.json.


NOTES
===
- run "npm run build" after every change
- restart server after server side changes
- deployment requirements: npm run db:schema:development, make sure the AWS keys are set, restart server, pass all tests

RELEASES
===

v2 - 2014-09-03
---
- [client] App design polish
- [client] Show and post send counts and attribution
- [server] Track send counts and attribution [Charlie - Done]
- [server] Admin priviledges

v3 - 2014-09-10
---
- [server] Expand ancestor_emoji [Charlie - Done]
- [server] account.id = username [Charlie - Skip, fully encapsulated by above]
- [server] Unified Search [Charlie - Done]
- [server] Following packs
- [server] Retrieving packs per user (for profile page)
- [server] Featured endpoint [Charlie - Done with emojis, waiting for following packs for rest]

TODO
===
- add csrf
- add http -> https redirect
- add mojigram.com -> www.mojigram redirect
- should shrinkwrap as part of the pre-commit hook
- use 201 for POST success
- Need to add tags_lower for search purposes.
- Need to honor deleted_at flag
- Need to update updated_at flag when things update
- Need to store arbitrary json
- Need to put back regex for emoji collection title
- Need to validate uuid v4 coming from client see uuid.parse()

- If S3 put fails should fail with 500
- Should not 404 if different user logs in and PUTs
- support smileys

- search should include public emojis/emoji collection_ids

- S3 signed urls for images to provide access to true private images
- Signature good for 30 days. New signatures blocked.

- during account update
- use image_url when creating emoji

- clear test db before running any tests. this is mainly for duplicate asset upload stuff
- validation for extraneous fields. If trying to update account.username, error is not thrown.

- password redactor

- disable editing for downloaded content.
- disable editing image for author.

- setup pack endpoint
2. Finish https and redirect seo
3. Support username/full name search
- change account.id = username, update existing entries in prod db.

A) following packs
B) Retrieving packs per user (for profile page)
C) Trending list of Packs/Mojis ranked by popularity
D) Dedicated endpoint for Featured Packs/Moji?

- expand tags to expand ids for responses.

- so it'll be GET /api/featured returning {emojis: [], emoji_collections: []}
- but we're still gonna store the emojis and emoji_collections on the @mojigram user
- use local gulp in npm/pre-comimt

- make sure deleted emoji minimums are returned when used as ancestor

- use marketing names (Moji, Pack)

- should not be able to create account while logged in?

- need to get user object from session to avoid deleted accounts still doing stuff due to sessions.

- when I try to register a new user through facebook
- it seems like priority is "username taken", then "email taken", then "FB ID is associated with another email"
- FB ID error first


CHANGELOG
===

2014-9-02
---
- url: get_url('/_/api/emoji/' + emoji_id + '?expand=emoji.ancestor_emoji_id,emoji.ancestor_emoji_id_expanded.created_by,emoji.ancestor_emoji_id_expanded.emoji_collection_id' for ancestor expansion

2014-8-29
---
- curl localhost:10000/_/api/emoji/fea09bb6-4785-4416-bf50-203043d8a96f?expand=emoji.created_by&emoji.ancestor_emoji_id
- unified search including accounts (full_name and username)
- Done with featured emojis

2014-8-28
---
- Cleaned up HomePage.js for Jeff. Use HomePage.js for the JS/HTML and use layout.less for css.
- Use supervisord to spawn nodejs. This sets up for using nginx.

2014-8-27
---
- POST /emoji?parent_emoji_id=<parent emoji id> // no POST body. This will create a new emoji as a clone of the <parent emoji id>
- Create two new columns in emoji (ancestor_emoji_id, parent_emoji_id). These will be populated if parent_emoji_id is set using the above endpoint. Otherwise, they will be blank.
- When 1. occurs, ancestor.saved_count += 1, parent.saved_count += 1. New Emoji sent_count = 0, saved_count = 0.
- If an emoji is sent, emoji.sent_count += 1, ancestor.sent_count += 1.
- When emoji is deleted, a deleted_at is set to true, but counters continue to be used.
- Can only modify emoji if creator and no parent_emoji_id.
- return emoji with more data

2014-8-26
---
- Use `npm run setup` before pushing to production.
- Use ValidationMixin for all validation.
- Add collections to search results.
- Use POST /_/api/event with {event: 'emoji_sent', properties: <emoji_id>} to track emoji sent.

2014-8-22
---
- Search deduping.
- Add sent_count and saved_count to emoji schema.

2014-8-20
---
- added endpoint to upload image. POST /_/api/asset
  - requires logged in user
  - returns asset_url
  - Future work to rate limit to one new upload every second.

- endpoint to save user's profile image on account creation. POST /_/api/account with profile_image_url

- endpoint to delete user's profile image. POST /_/api/account with a new profile_image_url
