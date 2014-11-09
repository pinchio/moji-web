var routes = [
    {
        route: '/'
      , handler: 'home'
    }
  , {
        route: '/artists'
      , handler: 'artist'
    }
  , {
        route: '/:username/packs/:pack_id/edit'
      , handler: 'emoji_collection_edit'
    }
]

module.exports = routes