# fizzbuzz
# Built with Seahorse v0.2.4

from seahorse.prelude import *

# This is your program's public key and it will update
# automatically when you build the project.
declare_id('11111111111111111111111111111111')

# A C C O U N T S

#User Account
class User(Account):
  owner: Pubkey
  last_post_id: u64

#Post Account
class Post(Account):
  owner: Pubkey
  id: u64
  likes: u64
  image: str
  title: str

#Like Account
class Like(Account):
  post_owner: Pubkey
  post_id: u64
  liker: Pubkey #Reference to Post

# I N S T R U C T I O N S

#Create User 
#Sera el owner y tendra permisos restringidos a su contenido
@instruction
def create_user(user: Empty[User], owner: Signer):
  #A wallet can only initialize one account
  user_account = user.init(
    payer = owner,
    seeds = ['user', owner] #New PubKey of the new user based on user & owner as seeds
  )
  user_account.owner = owner.key()
  print(owner.key(),'created user account',user_account.key())


#Create Post

#Edit Post

#Delete Post

#Like Post
