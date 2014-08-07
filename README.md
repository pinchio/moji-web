moji-web
===

Repository to serve www.mojigram.com and api.mojigram.com.


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


TODO:
- add csrf
- add https
- add http -> https redirect
- add mojigram.com -> www.mojigram redirecGot
- should shrinkwrap as part of the pre-commit hook
- use 201 for POST success
- sessions should be forever
- Need to add tags_lower for search purposes.
