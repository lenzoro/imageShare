import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Session } from 'meteor/session';
import { Accounts } from 'meteor/accounts-base';
import './main.html';

import '../lib/collections.js';


Session.set('imgLimit',3);
Session.set('userFilter',false);

Template.mainBody.helpers({
	// imagesFound(){
	// 	return imagesDB.find().count();
	// },


	imageAge(){
		imgcreatedon=  imagesDB.findOne({_id:this._id}).createdon;
		imgcreatedon= Math.round((new Date() - imgcreatedon)/60000);
		var timeUnit = " mins ago";
		if (imgcreatedon > 60 ){
			imgcreatedon=Math.round(imgcreatedon/60);
			timeUnit=" hours ago";
		}else if (imgcreatedon > 1440){
			imgcreatedon=Math.round(imgcreatedon/1440);
			timeUnit=" days ago";
		}
		return imgcreatedon + timeUnit;
	},

	allimg(){
		if (Session.get("userFilter")== false){


		var prevTime = new Date() - 15000;
		var newResults = imagesDB.find({"createdon":{$gte:prevTime}}).count();
		if(newResults > 0){
			return imagesDB.find({}, {sort: {createdon: -1 , imgrate: -1},limit:Session.get('imgLimit')});
		}else{
			return imagesDB.find({}, {sort: {imgrate: -1 , createdon: -1},limit:Session.get('imgLimit')});
		}
	}else{
		return imagesDB.find({postedby:Session.get("userFilter")}, {sort: {imgrate: -1 , createdon: 1},limit:Session.get('imgLimit')});
	}

		// console.log(newResults , "new image", prevTime);
		// return imagesDB.find({}, {sort: {imgrate: -1, createdon: -1}});

	},
	userLoggedIn(){
		if(Meteor.user()){
			return true;
		}else{
			return false;
		}

	},
	userName(){
		var uID=imagesDB.findOne({_id:this._id}).postedby;
		return Meteor.users.findOne({_id:uID}).username;
	},
	userId(){
		return imagesDB.findOne({_id:this._id}).postedby;
	}
});
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});
Template.myJumbo.events({
	'click .js-add'(event){
		$('#addimgmodal').modal("show");
			
	}
	
});
Template.addimg.events({
	'click .js-save'(event){
		var namepath = $("#namepath").val();
		var descpath = $("#descpath").val();
		var imgpath = $("#imgpath").val();

		$("#namepath").val('');
		$("#descpath").val('');
		$("#imgpath").val('');
		$("#addImgPreview").attr('src',"download.png");
		console.log("Working",namepath, descpath, imgpath);
		$('#addimgmodal').modal("hide");
		imagesDB.insert({"title":namepath, "desc":descpath, "img":imgpath, "createdon":new Date().getTime() , "postedby":Meteor.user()._id});
	},
	'input #imgpath'(event){
		var imgpath = $("#imgpath").val();
		$("#addImgPreview").attr('src',imgpath);
	}
});
Template.mainBody.events({
	'click .js-delete'(event){
		var imgID= this._id;
		console.log("test");
		$("#"+ imgID).fadeOut("slow","swing",function(){
  			imagesDB.remove({_id:imgID}); 	
  		});
	},
	'click .js-edit'(event){
		var imgID = this._id;
		$("#enamepath").val(imagesDB.findOne({_id:imgID}).title);
		$("#edescpath").val(imagesDB.findOne({_id:imgID}).desc);
		$("#eimgpath").val(imagesDB.findOne({_id:imgID}).img);
		$("#editImgPreview").attr('src',(imagesDB.findOne({_id:imgID}).img));
		$("#eId").val(imagesDB.findOne({_id:imgID})._id);
		$('#editimgmodal').modal("show");
	},
	'click .js-rate'(event){
		var imgid =this.data_id;
		var rating = $(event.currentTarget).data('userrating');
		console.log("You Clicked A Star", imgid, "with a rating of",rating);
		imagesDB.update({_id:imgid}, {$set:{'imgrate':rating}});
	},
	'click .js-showuser'(event){
		event.preventDefault();
		console.log(event.currentTarget.id);
		Session.set("userFilter" , event.currentTarget.id);
	},
	'click .js-clearFilter'(event){
		event.preventDefault();
		console.log(event.currentTarget.id);
		Session.set("userFilter" , false);
	}

});
Template.editimg.events({
	'click .js-editsave'(event, instance) {
  		var eId = $('#eId').val();
		var namepath = $("#enamepath").val();
		var descpath = $("#edescpath").val();
		var imgpath =  $("#eimgpath").val();
		// console.log()
		imagesDB.update({_id:eId}, {$set:{"title":namepath, "desc":descpath, "img":imgpath}});

		$('#editimgmodal').modal("hide");
	}
});
	lastScrollTop = 0;
	$(window).scroll(function(event){
			if($(window).scrollTop()+ $(window).height() >$(document).height() - 100) {
				var scrollTop = $(this).scrollTop();
				if (scrollTop > lastScrollTop){
					console.log("We have arrived at the bottom of the page");
					Session.set('imgLimit',Session.get('imgLimit') + 3);
				}
				lastScrollTop=scrollTop
			}
	});



