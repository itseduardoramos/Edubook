# Edubook
THIS IS NOT THE OFFICIAL VERSION. Social Networking developed in React.Js, JavaScript and Google Firebase. Because when I started developing this social networking I was a beginner React Developer, the code is not well optimized, so I keep fixing bugs and part of the design. I'm also adding new features so that Edubook keeps growing.

Now talkin about Edubook funcionalities:

You are able to log in using your Google account, this is because Google Firebase lets me use Google Authentication and helps me prove that account really exist.

When you log in, you see the navbar where you can see profile, home and messages sections.

In profile section you are able to change your name, profile picture and see your own posts.
In home section you can see all posts made by all the users, as well as being able to like, comment or report them. (once a post gets 5 reports, it gets deleted automatically).
In messages section you are able to choose any user and chat with them.
Once you log in, you get an id, which is going to help you keep using Edubook. In every section, I made a condition which asks for user id, if the user has no id, it means its not logged in and automatically is redirected to the login section and he/she won't be able to use Edubook until they log in with a Google account.

These are Edubook's main funcionalities, I'd like to add some new features in the future such as data saving, see other people's profiles and the possibility of adding friends. But for now, I'll be in change of fixing bugs and optimizing the code.

UPDATES:
- 02/19/23: I just optimized part of the profile, and home section by adding a new component "Publicaciones", as well as part of the database queriy code, now it reads the information faster.

-Eduardo Ramos
