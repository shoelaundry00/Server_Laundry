{
   "version": 2,
   "name": "shoe-laundry",
   "builds": [
      { "src": "app.js", "use": "@vercel/node" }
   ],
   "routes": [
      { "src": "/(.*)", "dest": "/" }
   ]
}
