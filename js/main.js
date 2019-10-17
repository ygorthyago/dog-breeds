$(document).ready(function(){
    $.ajax({
        url: "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyC2ApPaTrezVtUeL17Zq8ikHHKqg7olewU",
        success: function(success) {
            $.each(success.items, function (fonts, font) {
                $("#searchdogs-fonts").append('<option value="' + font.files.regular + '">' + font.family + '</option>')
            });
        }
    });
});


/*
 * First Load Breeds
 */
$(document).ready(function () {
    // Load Dogs in page load
    loadDogs()

    // Get all breed
    $.ajax({
        url: "https://dog.ceo/api/breeds/list/all",
        success: function (result) {
            var breeds = result.message;

            // firstDog = Object.keys(breeds)[0];
            // loadDogImage(firstDog)

            $.each(breeds, function (dog, breed) {
                // sub breeds
                if (breeds[dog].length >= 1) {
                    for (i = 0; i < breeds[dog].length; i++) {
                        $("#searchdogs-select").append('<option value="' + dog + '-' + breeds[dog][i] + '">' + breeds[dog][i] + ' ' + dog + '</option>');
                    }
                }

                // no sub breeds
                else if (breeds[dog].length < 1) {
                    $("#searchdogs-select").append('<option value="' + dog + '">' + dog + '</option>');
                }
            });
        },
        error: function (result) {
            console.log("Error: " + result)
            $("#searchdogs-select").html('<option value="erro">Sorry, we got a problem :(</option>')
        }
    });

    $("#colorpicker").spectrum({
        showPalette: true,
        palette: [
            ['black', 'red', 'blue', "yellow", "green"],
        ],
        color: "#000",
        change: function(color) {
            changeColor(color);
        }
    });

    $("#searchdogs-select").change(function() {
        changeDogBySelect(this);
    });

    $("#searchdogs-fonts").change(function() {
        changeFontBySelect(this);
    })

    $("#reset-button").click(function() {
        $(".searchdogs__button").attr("data-update", "true").removeAttr("data-index");
        $("#searchdogs-select").val("default");
        $("#searchdogs-fonts").val("default");
        $("#colorpicker").spectrum("set", "#000");
        changeColor("#000");
        $(".searchdogs__dogname").val("").removeAttr("style");
        $(".searchdogs__dogimage").attr("src", "assets/images/intro.png");
    })

    $(".searchdogs__button").click(function() {
        var DogName = $(".searchdogs__dogname").val()
        var DogBreed = $("#searchdogs-select").val()
        var DogFont = $("#searchdogs-fonts").val()
        var DogImage = $(".searchdogs__dogimage").attr("src");
        var DogColor = $("#colorpicker").spectrum("get").toHexString();
        var updateIndex = $(this).attr("data-index");
        
        if (DogName && DogBreed && $(this).attr("data-update") != "true") {
            saveNewDog(DogName, DogBreed, DogFont, DogImage, DogColor);
        }  else if ($(this).attr("data-update") == "true") {
            updateDog(DogName, DogBreed, DogFont, DogImage, DogColor, updateIndex);
        } else {
            $(".searchdogs__msg-error").addClass("searchdogs__msg-error--visible")

            setTimeout(function() {
                $(".searchdogs__msg-error").removeClass("searchdogs__msg-error--visible")
            }, 3000);
        }
    })

});

$(document).on('click', '.storeddogs__item', function(){ 
    getOldDog(this)
})

/*
 * Functions
 */
function loadDogs(){
    var dogs = localStorage.getItem("dogs");

    if (dogs) {
        $(".history__error-msg").remove();

        dogs = JSON.parse(dogs)

        $(".storeddogs__item[data-index]").fadeIn(300);
        setTimeout(function() {
            $(".storeddogs__item[data-index]").remove()
        }, 320);

        setTimeout(function() {    
            $.each(dogs, function (index, dog) {
                historyDogClone = $(".storeddogs__item--example").clone();
                historyDogClone.removeClass("storeddogs__item--example")
                historyDogClone.attr("data-index", index);
                historyDogClone.css("opacity", "0");
                historyDogClone.find("img").attr("src", dog.image)
                historyDogClone.find("img").attr("dog-breed", dog.breed)
                historyDogClone.find(".storeddogs__dogname").text(dog.name)
                historyDogClone.find(".storeddogs__dogname").attr("data-color", dog.color)
                historyDogClone.find(".storeddogs__dogname").attr("data-font", dog.font)
                historyDogClone.find(".storeddogs__dogbreed").text(dog.breed)

                $(".storeddogs").append(historyDogClone);
                setTimeout(function() {
                    $(".storeddogs__item[data-index='" + index + "']").css("opacity", "1");                
                }, 550 * index);
            })
        }, 350);
    }
}

function getOldDog(dog) {
    dog_name = $(dog).find(".storeddogs__dogname").text();
    dog_font = $(dog).find(".storeddogs__dogname").attr("data-font");
    dog_color = $(dog).find(".storeddogs__dogname").attr("data-color");
    dog_image = $(dog).find("img").attr("src");
    dog_breed = $(dog).find(".storeddogs__dogbreed").text();
    dog_index = $(dog).attr("data-index");
    
    $(".searchdogs__button").attr("data-update", "true").attr("data-index", dog_index);
    $("#searchdogs-select").val(dog_breed);
    $("#searchdogs-fonts").val(dog_font).change();
    $("#colorpicker").spectrum("set", dog_color);
    changeColor(dog_color);
    $(".searchdogs__dogname").val(dog_name);
    $(".searchdogs__dogimage").attr("src", dog_image);
}

// Load Dog Image
function loadDogImage(dog_image) {
    $.getJSON("https://dog.ceo/api/breed/" + dog_image + "/images/random", function(result) {
        $(".searchdogs__dogimage").css("opacity", 0)
        $(".searchdogs__dogimage").attr("src", result.message);
        $(".searchdogs__dogimage").attr("alt", dog_image);
        setTimeout(function() {
            $(".searchdogs__dogimage").css("opacity", 1)
        }, 1000);
    })
    .error(function(result) {
        console.log("Error: " + result)
        $(".searchdogs__dogimage").attr("src", "assets/images/error-dog.png");
    })
}

function changeDogBySelect(item) {
    selected_dog = $(item).val().replace('-', '/');
    
    if($(".searchdogs__button").attr("data-update") != "true") {
        loadDogImage(selected_dog);
    }
}

function changeFontBySelect(item) {
    new_font_src = $(item).find("option:selected").val();
    new_font_name = $(item).find("option:selected").text();
    new_font = new FontFace(new_font_name, 'url(' + new_font_src + ')');
    new_font.load().then(function(loaded_face) {
        document.fonts.add(loaded_face)
    }).catch(function(error) {});

    $(".searchdogs__dogname").css("font-family", new_font_name);
}

function changeColor(name_color) {
    $(".searchdogs__dogname").css("color", name_color)
}

function saveNewDog(newDogName, newDogBreed, newDogFont, newDogImage, newDogColor) {
    var dogs = localStorage.getItem("dogs");

    if (!dogs) {
        new_dog = {};
        dogs = [];
        
        new_dog = {
            name: newDogName,
            breed: newDogBreed,
            font: newDogFont,
            color: newDogColor,
            image: newDogImage
        }

        dogs.push(new_dog);

        localStorage.setItem("dogs", JSON.stringify(dogs))

        // Load dogs on add dog
        loadDogs()
    } else {
        new_dog = {};
        dogs = JSON.parse(dogs)
        
        new_dog = {
            name: newDogName,
            breed: newDogBreed,
            font: newDogFont,
            color: newDogColor,
            image: newDogImage
        }

        dogs.push(new_dog)
        localStorage.setItem("dogs", JSON.stringify(dogs))

        // Load dogs on add dog
        loadDogs()
    }
}

function updateDog(DogName, DogBreed, DogFont, DogImage, DogColor, updateIndex) {
    var dogs = localStorage.getItem("dogs");
    dogs = JSON.parse(dogs)

    dogs[updateIndex] = {
        name: DogName,
        breed: DogBreed,
        font: DogFont,
        color: DogColor,
        image: DogImage
    }

    localStorage.setItem("dogs", JSON.stringify(dogs))

    // Load dogs on add dog
    loadDogs()
}