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
- add https
- add http -> https redirect
- add mojigram.com -> www.mojigram redirect
- should shrinkwrap as part of the pre-commit hook
- use 201 for POST success
- sessions should be forever
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

- endpoint to upload image
- endpoint to save user's profile image
- endpoint to delete user's profile image
- during account update
- filter on unique asset_urls for search
- make sure search returns public collections
- send count for each individual emoji
- save count for each emoji (this is the number of times someone else cloned it)
- attribution back to original
- use image_url when creating emoji

- move out validation logic

- put something on home page that's not an upload form.

- clear test db before running any tests. this is mainly for duplicate asset upload stuff

CHANGELOG
===
2014-8-14
- added endpoint to upload image. POST /_/api/asset
  - requires logged in user
  - returns asset_url

