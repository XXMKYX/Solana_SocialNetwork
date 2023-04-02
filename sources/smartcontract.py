# Built with Seahorse v0.2.4

from seahorse.prelude import *

# This is your program's public key and it will update
# automatically when you build the project.
declare_id('FygQ6WgxY1cTtyY9Lp5Wn43VRG9v5o4s1Q27c8FADft3')

## A C C O U N T S ##

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

## I N S T R U C T I O N S ##

#Create User 
#Sera el owner y tendra permisos restringidos a su contenido
@instruction
def create_user(user: Empty[User], owner: Signer): #Before : Params || After : Logic
  #A wallet can only initialize one account
  user_account = user.init(
    payer = owner,
    seeds = ['user', owner] #New PubKey of the new user based on user & owner as seeds
  )
  user_account.owner = owner.key()
  print(owner.key(),'created user account',user_account.key())


#Create Post
@instruction
def create_post(
  post: Empty[Post], 
  user: User, 
  owner: Signer,
  title: str,
  image: str,
  post_id: u64
):
  assert user.owner == owner.key(), 'Incorrect Owner' #If false, show message
  assert post_id == user.last_post_id + 1, 'error message' #if id continue be cero, show menssage

  #Initialize post
  post_account = post.init(
    payer = owner,
    seeds = ['post',owner,post_id], #Seahorse limite set user_account.key 
    #so we define the space of the post account content
    space = 8 + 32 + 8 + 4 + 128 + 4 + 256
  )
  #Update post counter 0 to 1
  user.last_post_id += 1
  post_account.owner = owner.key()
  post_account.title = title
  post_account.image = image
  post_account.id = user.last_post_id

  print(f'Post id: {post_id}, title: {post_account.title}, image: {post_account.image}')

  #Emit new post event
  new_post_event = NewPostEvent(post_account.owner, post_account.id) #Created the instance whit params
  new_post_event.emit()
  
#Update Post
@instruction
def update_post(post: Post, owner: Signer, title: str):
  assert post.owner == owner.key(), 'Incorrect Owner'

  print('Old title:', post.title, 'New title', title)

  post.title = title

  #Emit update post event
  update_post_event = UpdatePostEvent(post.owner, post.id) #Created the instance whit params
  update_post_event.emit()

#Delete Post
@instruction
def delete_post(post: Post, owner: Signer):
  assert post.owner == owner.key(), 'Incorrect Owner'
  #Close the post (post account) by transferring the lamports to the owner
  post.transfer_lamports(owner, rent_exempt_lamports(440))

  #Emit update post event
  update_post_event = DeletePostEvent(post.owner, post.id) #Created the instance whit params
  update_post_event.emit()
  
#Like Post

## E V E N T S ##

#Trigger to Create Post
class NewPostEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Update Post
class UpdatePostEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Delete Post
class DeletePostEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Calculate rend to refund afted delete the post
#In this seahorse version can't acces lamports  
def rent_exempt_lamports(size: u64) -> u64:
  return 897840 + 6960 + (size - 1)