$(document).ready(function(){

    // Load All Google Fonts
    load_fonts("AIzaSyC2ApPaTrezVtUeL17Zq8ikHHKqg7olewU");

    // Load Dogs in page load
    load_dogs();

    // Get all breed
    load_all_breeds();

    // Color Picker Plugin
    run_collor_picker();

    $(document).on('change', '#searchdogs-select', function(){
        load_dog_image(this);
    });

    $("#searchdogs-fonts").change(function() {
        change_font_by_select(this);
    })

    $("#reset-button").click(function() {
        reset_dog_form();
    })

    $(".searchdogs__button").click(function() {
        var DogName = $(".searchdogs__dogname").val()
        var DogBreed = $("#searchdogs-select").val()
        var DogFont = $("#searchdogs-fonts").val()
        var DogImage = $(".searchdogs__dogimage").attr("src");
        var DogColor = $("#colorpicker").spectrum("get").toHexString();
        var updateIndex = $(this).attr("data-index");
        
        if (DogName && DogBreed && $(this).attr("data-update") != "true") {
            save_new_dog(DogName, DogBreed, DogFont, DogImage, DogColor);
        }  else if ($(this).attr("data-update") == "true") {
            update_dog(DogName, DogBreed, DogFont, DogImage, DogColor, updateIndex);
        } else {
            $(".searchdogs__msg-error").addClass("searchdogs__msg-error--visible")

            setTimeout(function() {
                $(".searchdogs__msg-error").removeClass("searchdogs__msg-error--visible")
            }, 3000);
        }
    })

    $(document).on('click', ".storeddogs__remove", function() {
        var DogName = $(".searchdogs__dogname").val()
        var DogBreed = $("#searchdogs-select").val()
        var DogFont = $("#searchdogs-fonts").val()
        var DogImage = $(".searchdogs__dogimage").attr("src");
        var DogColor = $("#colorpicker").spectrum("get").toHexString();
        var updateIndex = $(this).attr("data-index");
        update_dog(DogName, DogBreed, DogFont, DogImage, DogColor, updateIndex, true);
    })

    $(document).on('click', '.toggle-history', function(){
        $('.history').toggleClass('history--active')
        $('.toggle-history').toggleClass('toggle-history--active')
    })
    
});

$(document).on('click', '.storeddogs__item picture , .storeddogs__item .storeddogs__col', function(){ 
    get_old_dog(this);
})

/*
 * Functions
 */

/**
 * @external
 * @param {string} apiKey 
 */
function load_fonts(apiKey) {
    $.ajax({
        url: "https://www.googleapis.com/webfonts/v1/webfonts?key=" + apiKey,
        success: function(success) {
            // Populate fonts select input
            $.each(success.items, function (fonts, font) {
                let fontItem = '<option value="' + font.files.regular + '">' + font.family + '</option>';
                $("#searchdogs-fonts").append(fontItem);
            });
        }
    });
}

/**
 * @function
 * @description This function load the stored dogs on sidebar
 */
function load_dogs(){
    // Get Dogs from Local Storage and turn data into Objects
    var dogs = JSON.parse(localStorage.getItem("dogs"));

    if (dogs.length && dogs && typeof dogs !== 'undefined') {
        $(".history__error-msg").css("display", "none");

        // Remove old dogs to update
        $(".storeddogs__item[data-index]").fadeIn(300);
        setTimeout(function() {
            $(".storeddogs__item[data-index]").remove();
        }, 320);

        // Show all dogs in local storage
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

                if (dog.breed.indexOf("-") !== -1) {
                    console.log("1" + dog.breed)
                    dog.breed = dog.breed.split("-");
                    console.log("2" + dog.breed)
                    historyDogClone.find(".storeddogs__dogbreed").text(dog.breed[0] + " " + dog.breed[1])
                }

                // Show items in fade effect
                $(".storeddogs").append(historyDogClone);
                setTimeout(function() {
                    $(".storeddogs__item[data-index='" + index + "']").css("opacity", "1");                
                }, 550 * index);
            })
        }, 350);
    } else {
        $(".history__error-msg").fadeIn();
    }
}

/**
 * @external
 * @description Get all breeds on page load
 */
function load_all_breeds() {
    $.ajax({
        url: "https://dog.ceo/api/breeds/list/all",
        success: function (result) {
            var breeds = result.message;

            $.each(breeds, function (dog, breed) {
                // Populate Sub Breeds
                if (breeds[dog].length >= 1) {
                    for (i = 0; i < breeds[dog].length; i++) {
                        $("#searchdogs-select").append('<option value="' + dog + '-' + breeds[dog][i] + '">' + breeds[dog][i] + ' ' + dog + '</option>');
                    }
                }

                // Populate Parent Breeds
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
}

/**
 * @function
 * @description Script to run Collor Picker Plugin
 */
function run_collor_picker() {
    $("#colorpicker").spectrum({
        showPalette: true,
        palette: [
            ['black', 'red', 'blue', "yellow", "green"],
        ],
        color: "#000",
        preferredFormat: "hex",
        change: function(color) {
            // Change Name Input Color
            change_color(color);
        }
    });
}

/**
 * @function
 * @description Function to get and edit old dogs in local storage
 * @param {DOM Element} dog 
 */
function get_old_dog(dog) {
    dog_name = $(dog).parents(".storeddogs__item").find(".storeddogs__dogname").text();
    dog_font = $(dog).parents(".storeddogs__item").find(".storeddogs__dogname").attr("data-font");
    dog_color = $(dog).parents(".storeddogs__item").find(".storeddogs__dogname").attr("data-color");
    dog_image = $(dog).parents(".storeddogs__item").find("img").attr("src");
    dog_breed = $(dog).parents(".storeddogs__item").find("img").attr("dog-breed");
    dog_index = $(dog).parents(".storeddogs__item").attr("data-index");
    
    $(".searchdogs__button").attr("data-update", "true").attr("data-index", dog_index);
    $("#searchdogs-select").val(dog_breed);
    $("#searchdogs-fonts").val(dog_font).change();
    $("#colorpicker").spectrum("set", dog_color);
    change_color(dog_color);
    $(".searchdogs__dogname").val(dog_name);
    $(".searchdogs__dogimage").attr("src", dog_image);
}

/**
 * @function
 * @description Get Random Breed Dog Image and Update in Form
 * @param {DOM Element} item 
 */
function load_dog_image(item) {
    if($(".searchdogs__button").attr("data-update") != "true") {
        selectedDog = $(item).val().replace('-', '/');
    
        $.getJSON("https://dog.ceo/api/breed/" + selectedDog + "/images/random", function(result) {

            // Fade Effect on Image Change
            $(".searchdogs__dogimage").css("opacity", 0)
            $(".searchdogs__dogimage").attr("src", result.message);
            $(".searchdogs__dogimage").attr("alt", selectedDog);
            setTimeout(function() {
                $(".searchdogs__dogimage").css("opacity", 1)
            }, 1000);
        })
        .error(function(result) {
            console.log("Error: " + result)
            $(".searchdogs__dogimage").attr("src", "assets/images/error-dog.png");
        })
    }
}

/**
 * @function
 * @description Change Font Dog Name on select change
 * @param {DOM Element} item 
 */
function change_font_by_select(item) {
    new_font_src = $(item).find("option:selected").val();
    new_font_name = $(item).find("option:selected").text();
    new_font = new FontFace(new_font_name, 'url(' + new_font_src + ')');
    new_font.load().then(function(loaded_face) {
        document.fonts.add(loaded_face)
    }).catch(function(error) {});

    $(".searchdogs__dogname").css("font-family", new_font_name);
}

/**
 * @function
 * @description Change Color Dog Name on select change
 * @param {string} name_color 
 */
function change_color(name_color) {
    $(".searchdogs__dogname").css("color", name_color)
}

/**
 * @function
 * @description Add new dog to Local Storage Object
 * @param {string} newDogName 
 * @param {string} newDogBreed 
 * @param {string} newDogFont 
 * @param {string} newDogImage 
 * @param {string} newDogColor 
 */
function save_new_dog(newDogName, newDogBreed, newDogFont, newDogImage, newDogColor) {
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
        load_dogs();

        // Reset Form
        reset_dog_form()
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
        load_dogs()

        // Reset Form
        reset_dog_form()
    }
}

/**
 * @function
 * @description Update dog in Local Storage
 * @param {string} DogName 
 * @param {string} DogBreed 
 * @param {string} DogFont 
 * @param {string} DogImage 
 * @param {string} DogColor 
 * @param {string} updateIndex 
 */
function update_dog(DogName, DogBreed, DogFont, DogImage, DogColor, updateIndex, removeItem) {
    var dogs = localStorage.getItem("dogs");
    dogs = JSON.parse(dogs)

    if (removeItem) {
        dogs.splice(updateIndex, 1);
    } else {
        dogs[updateIndex] = {
            name: DogName,
            breed: DogBreed,
            font: DogFont,
            color: DogColor,
            image: DogImage
        }
    }

    localStorage.setItem("dogs", JSON.stringify(dogs))

    // Load dogs on add dog
    load_dogs()
    
    // Reset Form
    reset_dog_form()
}

/**
 * @function
 * @description Reset Form to add New Dog
 */
function reset_dog_form() {
    $(".searchdogs__button").attr("data-update", "true").removeAttr("data-index");
    $("#searchdogs-select").val("default");
    $("#searchdogs-fonts").val("default");
    $("#colorpicker").spectrum("set", "#000");
    change_color("#000");
    $(".searchdogs__dogname").val("").removeAttr("style");
    $(".searchdogs__dogimage").attr("src", "assets/images/intro.png");
}