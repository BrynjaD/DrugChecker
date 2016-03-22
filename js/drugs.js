$(function(){
	
	var model = {
		meds: [],
		addMed: function(medName) {
			$.ajax({
               'url': 'https://rxnav.nlm.nih.gov/REST/rxcui?name=' + medName,
               'type': 'GET',
               'dataType': 'json',
               'success': function(response) {
                        console.log(response);
                        var med = {};
                        med.name = response.idGroup.name;
                        med.rxnormId = response.idGroup.rxnormId[0];
                        console.log(med); 
                        model.meds.push(med);
                }
            });
		},
		getInteractions: function(callback) {
			if (this.meds.length < 2)
				return;

			var medsQuery = "";        
            for (var i = 0; i < this.meds.length; i++) {
                medsQuery += this.meds[i].rxnormId;
                    
                if (i !== this.meds.length - 1)
                    medsQuery += '+'; 
            }

			$.ajax({
	            'url': 'https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=' + medsQuery,
	            'type': 'GET',
	            'dataType': 'json',
	            'success': function(response) {
	            	var interactions = [];
	                console.log(response);
	               if (!response.fullInteractionTypeGroup) {
	                    alert("NO RESULTS");
	                }

	                for (var i = 0; i < response.fullInteractionTypeGroup[0].fullInteractionType.length; i++) {
	                  	for (var j = 0; j < response.fullInteractionTypeGroup[0].fullInteractionType[i].interactionPair.length; j++) {
	                        console.log("Pushing: " + response.fullInteractionTypeGroup[0].fullInteractionType[i].interactionPair[j].description);
	                        interactions.push(response.fullInteractionTypeGroup[0].fullInteractionType[i].interactionPair[j].description);
	                    }
	                }

	                callback(interactions);
	        	}
        	});
		}	
	};

	var octopus = {
		init: function() {
			view.init(); 
		},
		addMed: function(medName) {
			model.addMed(medName);
		},
		getInteractions: function(callback) {
			return model.getInteractions(callback);
		}
	};

	var view = {
		init: function() {
			console.log("View init");
			this.drugInput = $("#drugInput");
			console.log("Drug input: ");
			console.log(this.drugInput);
			this.interactionList = $("#interaction-list");
			this.medsList = $("#drugList");
            
            //Pressing the enter button after input triggers the Add button.
            $('#drugInput').keydown(function(event){    
                if(event.keyCode==13){
                    $('#btn-submit').trigger('click');
                }
            });
            
			//Add event handlers (they should probably call functions in the octupus)
			$("#btn-submit").on('click', function() {
				console.log("Click");
				console.log(view.drugInput);
				var medName = view.drugInput.val();
	           	view.drugInput.val("");
				var medLi = $("<li/>");
		        medLi.text(medName);
		        medLi.addClass("list-group-item");
		        view.medsList.append(medLi);

		        //Give the medName to the octupus (which should give it to the model and save it there)
		        octopus.addMed(medName);
		    });

		    $("#checkDrug").on('click', function() {
		    	view.render(); //Renders all of the interactions
		    });

			this.render();
		},
		render: function() {
			//Get the list of interactions and render them 
			octopus.getInteractions(function(response) {
				var interactions = response;
				view.interactionList.empty();
	            for (var i = 0; i < interactions.length; i++) {
	                var li = $("<li/>");
	                li.addClass("list-group-item");
	                li.text(interactions[i]);
	                view.interactionList.append(li);                      
	            }
                
			});
		}
	};

	octopus.init();
});