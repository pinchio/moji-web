moji-web
===

Repository to serve www.mojigram.com and api.mojigram.com.

Install
===
1. Install nvm through `http://github.com/creationix/nvm`

2. Get AWS access token from someone and copy to ~/.elasticbeanstalk/aws_credential_file. chmod 400 file.

3. Install postgres and run `npm run db:schema:development`

4. Try to run tests after uploading your own override.json.


===

ENDPOINTS

1. Register
parameters:
return types: success, duplicate email, duplicate username, empty strings for required fields (we'll check on client side first too)
notes: sessions should last forever
docs: see `src/account/server/AccountHTTPService.test.js`

2. Login
parameters: username, password
return types: success, invalid login, empty strings for required fields (we'll check on client side first too)

3. Post emoji
parameters: various metadata as mentioned in spec
return types: success (return unique id), fail

4a. Retrieve all emojis
parameters: username, collection_id (optional)

4b. Retrieve 1 emoji given emoji_id
parameter: emoji_id

5. Create collection
parameters: color, username
return types: success (return unique id), fail

6. Retrieve collections
parameters: username
return: collection_id's, number of emojis in each collection, first emoji of each collection (or empty if no emojis in that collection)

7. Delete collection
parameter: collection_id
return types: success (would delete all emojis in that collection), fail

Note:
- A collection is a set of emojis. An user can have multiple collections. A collection can be empty.


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

1. Setup skeleton pages.

charlie [2:22 AM]
2. Finish https and redirect seo

charlie [2:22 AM]
3. Support username/full name search

A) following packs
B) Retrieving packs per user (for profile page)
C) Trending list of Packs/Mojis ranked by popularity
D) Dedicated endpoint for Featured Packs/Moji?

also plz include parent_moji_id in the response of GETting and POSTing mojis

- change account.id = username, update existing entries in prod db.


CHANGELOG
===

2014-8-28
---
- Cleaned up HomePage.js for Jeff. Use HomePage.js for the JS/HTML and use layout.less for css.


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
