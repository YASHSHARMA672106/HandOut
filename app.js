var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport'); 

// Connect to db
mongoose.connect('mongodb://localhost:27017/handout', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
console.log('connected to MonngoDB');
});

// Init app
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable
app.locals.errors = null;

// Get Page Model
var Page = require('./models/page');

// Get all pages to pass to header.ejs
//Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
//    if (err) {
  //      console.log(err);
    //} else {
      //  app.locals.pages = pages;
   // }
//});

// Get Category Model
var Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

// Express fileUpload middleware
app.use(fileUpload());

// Body Parser middleware
// 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());


// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
//  cookie: { secure: true }
}));

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
   res.locals.cart = req.session.cart;
   res.locals.user = req.user || null;
   next();
});
//contact_________________________________________________________________
var contactSchema = new mongoose.Schema({
   name: String,
   email: String,
	message: String,

});

var contact = mongoose.model("contact", contactSchema);
//end_____________________________________________________________________

//contact1_________________________________________________________________
var contact1Schema = new mongoose.Schema({
    firstname: String,
	lastname: String,
    email: String,
	Mobile: String
});

var contacts = mongoose.model("contacts", contact1Schema);
//end_____________________________________________________________________

var suggestionSchema = new mongoose.Schema({
    suggestion: String,
});

var suggestions = mongoose.model("suggestion", suggestionSchema);

// Set routes 
//var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
//var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');


//app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
//app.use('/', pages);


app.get("/", function(req, res){
	res.render("hell.ejs");
});

app.get("/contact", function(req, res){
	var loggedIn = (req.isAuthenticated()) ? true : false;
	contact.find({}, function(err, contact){
		if(err){
			console.log(err);
		}else{
			res.render("contact.ejs", {contact:contact});
			loggedIn: loggedIn;
		}
	});
});
app.post("/contact", function( req, res ){
	    req.flash('success', "Thanks for submitting");
		res.redirect("/contact");
});
app.get("/mission", function(req, res){
	res.render("mission.ejs");
});
app.get("/terms", function(req, res){
	res.render("terms.ejs");
});
//retailer_________________________________________________________________
app.get("/retailer", function(req, res){
	var loggedIn = (req.isAuthenticated()) ? true : false;
	res.render("ret.ejs", {contacts:contacts});
			loggedIn: loggedIn;
});
app.post("/retailer", function(req, res){
	var loggedIn = (req.isAuthenticated()) ? true : false;
	var firstname= req.body.firstname;
	var lastname= req.body.lastname;
	var email= req.body.email;
	var Mobile= req.body.Mobile;
	var newretailer= {firstname:firstname, lastname:lastname, email:email, Mobile:Mobile};
	contacts.create(newretailer, function(err, newretailer){
		if(err){
			console.log(err);
		}else{
			req.flash('success', "Thanks for submitting");
			res.redirect("/retailer");
			loggedIn: loggedIn;
		}
	});
});
//end______________________________________________________________________
app.get("/shipping", function(req, res){
	res.render("shipping.ejs");
});
app.get("/FAQ", function(req, res){
	res.render("faq.ejs");
});
app.get("/suggestion", function(req, res){
	var loggedIn = (req.isAuthenticated()) ? true : false;
	res.render("suggestion.ejs", {suggestions:suggestions});
				loggedIn: loggedIn;
});
app.post("/suggestion", function(req, res){
	var loggedIn = (req.isAuthenticated()) ? true : false;
	var suggestion= req.body.suggestion;
	var newsuggestion= {suggestion:suggestion};
	suggestions.create(newsuggestion, function(err, newsuggestion){
		if(err){
			console.log(err);
		}else{
			req.flash('success', "Thanks for submitting");
			res.redirect("/suggestion");
			loggedIn: loggedIn;
		}
	});
});
// Start the server
app.listen(process.env.PORT||3000, process.env.IP, function(){
	console.log("yelpcamp server has started");
});
