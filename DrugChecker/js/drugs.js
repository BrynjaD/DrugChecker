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
			this.drugInput = document.getElementById('drugInput');
			console.log("Drug input: ");
			console.log(this.drugInput);
			this.interactionList = $("#interaction-list");
			this.medsList = $("#list");
            var medNames = [];

            /*$( "#tags" ).autocomplete({
                source: ""
            });*/

			$(".glyphicon-remove").on('click', function(){
				$(this).closest('li').remove();
			});
            //Pressing the enter button after input triggers the Add button.
            $('#drugInput').keydown(function(event){    
                if(event.keyCode==13){
                    $('#btn-submit').trigger('click');
                }
            });
            
			//Add event handlers (they should probably call functions in the octopus)
			$("#btn-submit").on('click', function() {

				if(!$('#drugInput').val())
				{
					$('#alert').html("<strong>Warning!</strong> You forgot to enter a drug!");
					$('#alert').fadeIn().delay(2000).fadeOut();
                    console.log("Nothing in input");
				}
                else {
                   // console.log("Click");
                   // console.log(view.drugInput);
                    var medName = view.drugInput.value;
                    view.drugInput.value = "";
                    var medLi = $("<li/>");
                    medLi.text(medName);
                    medLi.addClass("list-group-item");
                    var removeBtn = $("<a/>");
                    removeBtn.addClass("glyphicon glyphicon-remove removeBtn");
                    medLi.append(removeBtn);
                    view.medsList.append(medLi);

                    var splitter = $('#list').html();
                    medNames = splitter.split("</li>");
                    medNames.pop();
                    for (var i = 0; i < medNames.length; i++) {
                        medNames[i] = medNames[i].toString() + "</li>";
                    }

                    localStorage.removeItem("Drug Name");
                    localStorage.setItem("Drug Name", JSON.stringify(medNames));
                    //console.log(medNames);
                    medNames = [];

                }

		        //Give the medName to the octopus (which should give it to the model and save it there)
		        octopus.addMed(medName);
		    });

            $('#list')
            {
                if(localStorage.getItem("Drug Name") != null) {
                    var medNamesGet = JSON.parse(localStorage.getItem("Drug Name"));
                    for (var i = 0; i < medNamesGet.length; i++) {
                        view.medsList.append(medNamesGet[i]);
                    }
                }
            }

            $(".removeBtn").on('click', function () {
				$(this).closest('li').remove();

				localStorage.clear();
            });

		    $("#checkDrug").on('click', function() {
                octopus.getInteractions(function(response) {
                   console.log(response);
                });
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