//outlining types of objects, as per object-oriented Javascript
//objects are defined and stored as variables in the namespace

var game=[]; //This is the Javascript namespace, from which all other variables can be reached

//a GameObject is an object within the game
//it has a position and size, a list of child objects and a single parent object
//it also has the render, update, and setVisible methods
//all objects are located at their top left corner
game.GameObject = function (x, y, width, height, parent) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.childObjects = [];
    if (parent != undefined) {
        this.parent = parent;
    }
    this.visible = false;
}

//The render method should display the object to the screen in some way
//It then displays all children, which appear above it
game.GameObject.prototype.render = function (context) {
    if (this.visible) {
        for (var x = 0; x < this.childObjects.length; x++) {
            this.childObjects[x].render(context);
        }
    }
}

//The update method should update the parameters of the object each game loop
//The default method is unimplemented and should always be overridden
game.GameObject.prototype.update = function () {
    for (var x = 0; x < this.childObjects.length; x++) {
        this.childObjects[x].update(game.context);
    }
}

//The setVisible method should be used to make an object visible
//It also updates the visibility of all child objects
game.GameObject.prototype.setVisible = function (visible) {
    this.visible = visible;
    for (var x = 0; x < this.childObjects.length; x++) {
        this.childObjects[x].setVisible(visible);
    }
}

//a Background is a non-animated image that is either static or follows a Button
//Backgrounds and other objects can be visible or invisible
//If invisible, block all interactivity and do not render
game.Background = function (x, y, width, height, parent, imgSrc) {
    game.GameObject.call(this, x, y, width, height, parent);
    this.img = new Image();
    this.img.width = this.width;
    this.img.height = this.height;
    this.img.onload = function () { this.imgReady = true; }
    this.img.src = imgSrc;
}

game.Background.prototype = Object.create(game.GameObject.prototype);
game.Background.prototype.constructor = game.Background;

//The Background draws an image to the screen
//Backgrounds, as all GameObjects, are drawn relative to their parent
game.Background.prototype.render = function (context) {
    if (this.visible && this.img.imgReady) {
        if (this.parent == undefined) {
            context.drawImage(this.img, this.x, this.y, this.img.width, this.img.height);
        } else {
            context.drawImage(this.img, this.parent.x + this.x, this.parent.y + this.y, this.img.width, this.img.height);
        }
    }
    game.GameObject.prototype.render.call(this, context);
}

game.Background.prototype.setVisible = function (visible) {
    game.GameObject.prototype.setVisible.call(this, visible);
}

game.CostStats = function (costPP, costCult) {
    this.costPP = costPP;
    this.costCult = costCult;
}

game.ToolStats = function (costPP, costCult, prodRateCult, prodRatePris, prodRateExec, numTools) {
    this.costPP = costPP;
    this.costCult = costCult;
    this.prodRatePris = prodRatePris;
    this.prodRateCult = prodRateCult;
    this.prodRateExec = prodRateExec;
    this.numTools = numTools;
}

//Text objects draw text to the screen
//Text objects render text in the default font, unless otherwise specified
game.Text = function (parent, x, y, text, font, fillStyle, lineWidth, strokeStyle) {
    game.GameObject.call(this, x, y, null, null, parent);
    this.parent = parent; //linked Background
    this.text = text;
    if (font) {
        this.font = font;
        this.fillStyle = fillStyle;
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
    } else {
        this.font = "bold 28pt lucida console";
        this.fillStyle = "white";
        this.lineWidth = 6;
        this.strokeStyle = "#5f3c0f";
    }
    this.parent.childObjects.push(this); //add this text to the background
}

//Text objects render to the screen
game.Text.prototype.render = function(context) {
    if(this.visible) {
        context.font = this.font;
        context.textBaseline = "top";
        context.fillStyle = this.fillStyle;
        context.strokeStyle = this.strokeStyle;
        context.lineWidth = this.lineWidth;

        //to prevent ugly spike
        context.lineJoin = 'round';
        context.miterLimit = 2;
        
        if (this.parent) {
            context.strokeText(this.text, this.parent.x + this.x, this.parent.y + this.y);
            context.fillText(this.text, this.parent.x + this.x, this.parent.y + this.y);
        } else {
            context.strokeText(this.text, this.x, this.y);
            context.fillText(this.text, this.x, this.y);
        }
        //render all child objects (normally none)
        game.GameObject.prototype.render.call(this, context);
    }
}

game.Text.prototype.setVisible = function (visible) {
    game.GameObject.prototype.setVisible.call(this, visible);
}

game.Text.prototype.update = function () {
    game.GameObject.prototype.update.call(this);
}

//TextWrap for description paragraphs because canvas doesnt do this 
game.TextWrap = function (parent, x, y, text, font, fillStyle, lineWidth, strokeStyle, maxWidth, lineHeight) {
    game.Text.call(this, parent, x, y, text, font, fillStyle, lineWidth, strokeStyle);
    this.maxWidth=maxWidth;
    this.lineHeight=lineHeight;
}

game.TextWrap.prototype = Object.create(game.Text.prototype);
game.TextWrap.prototype.constructor = game.TextWrap;

game.TextWrap.prototype.render = function (context) {
    if (this.visible) {
        context.font = this.font;
        context.textBaseline = "top";
        context.fillStyle = this.fillStyle;
        context.strokeStyle = this.strokeStyle;
        context.lineWidth = this.lineWidth;

        //to prevent ugly spike
        context.lineJoin = 'round';
        context.miterLimit = 2;

        var bgy = this.parent.y;
        
        var words = this.text.split(' ');
        var line = '';
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > this.maxWidth && n > 0) {
                context.strokeText(line, this.parent.x + this.x, bgy + this.y);
                context.fillText(line, this.parent.x + this.x, bgy + this.y);

                line = words[n] + ' ';
                bgy += this.lineHeight;
            } else {
                line = testLine;
            }
        }
        context.strokeText(line,this.parent.x+this.x, bgy+this.y);
        context.fillText(line,this.parent.x+this.x, bgy+this.y);
    }
}

//Numbers are text objects that display numbers
//They dynamically update the text within to match an internal counter
//Formatting for larger numbers e.g. 1 billion, 2.014 e24
game.TextNumber = function (parent, x, y, text, font, fillStyle, lineWidth, strokeStyle, statLocation, statIndex) {
    game.Text.call(this, parent, x, y, text, font, fillStyle, lineWidth, strokeStyle); //Numbers are a subclass of Text
    this.statLocation = statLocation;
    this.statIndex = statIndex;
    this.suffixes = ['', 'k', 'm', 'b', 't'];
    this.textSuffix = text;
}

game.TextNumber.prototype = Object.create(game.Text.prototype);
game.TextNumber.prototype.constructor = game.TextNumber;

game.TextNumber.prototype.update = function (context) {
    if (this.statLocation[this.statIndex] < 1000) {
        if (this.statLocation[this.statIndex] < 1 && this.statLocation[this.statIndex] > 0) {
            this.text = "."+Math.floor(this.statLocation[this.statIndex]*10);
        } else {
            this.text = Math.floor(this.statLocation[this.statIndex]);
        }
    } else {
        var power = Math.floor(Math.log10(this.statLocation[this.statIndex]));
        var order = Math.floor(power / 3);
        if (Math.log10(this.statLocation[this.statIndex]) < 15) {
            this.text = Math.floor(this.statLocation[this.statIndex] / Math.pow(10, 3 * order)) + this.suffixes[order];
        } else {
            this.text = parseFloat(this.statLocation[this.statIndex] / Math.pow(10, power)).toFixed(1) + "e" + power;
        }
    }
    this.text += this.textSuffix;
}

game.TextNumber.prototype.setVisible = function (visible) {
    game.GameObject.prototype.setVisible.call(this, visible)
}

//Overlays are objects that appear when a button is hovered over
game.Overlay = function (button, width, height, x, y, produces) {
    game.GameObject.call(this, x, y, width, height, button);
    this.x = x+this.parent.x;
    this.y = y+this.parent.y;
    this.width = width;
    this.height = height;
    this.button = button;
    this.background = new game.Background(0, 0, this.width, this.height, this, "img/description.png");
    this.childObjects.push(this.background);
    this.coin = new game.Background(20, 12, 37, 37, this, "img/coin.png");
    this.childObjects.push(this.coin);
    this.costPP = new game.TextNumber(this, 65, 15, "", "bold 28pt lucida console ", "white", 6, "#5f3c0f", this.button.costStats, "costPP");
    
    this.happy = new game.Background(170, 12, 37, 37, this, "img/happy.png");
    this.childObjects.push(this.happy);
    this.costCult = new game.TextNumber(this, 215, 15, "", "bold 28pt lucida console ", "white", 6, "#5f3c0f", this.button.costStats, "costCult");
    if (produces) {
        this.prodText = new game.Text(this, 25, 62, "Produces:", "bold 18pt lucida console ", "white", 3, "#5f3c0f");
        if (produces == "cult") {
            this.prodIcon = new game.Background(155, 52, 37, 37, this, "img/happy.png");
            this.prodNumber = new game.TextNumber(this, 192, 53, "/s", "bold 28pt lucida console ", "white", 6, "#5f3c0f", this.button.costStats, "prodRateCult");
            this.description = new game.TextWrap(this, 25, 95, this.button.description, "bold 18pt lucida console ", "white", 3, "#5f3c0f", 470, 28);
        } else if (produces == "pris") {
            this.prodIcon = new game.Background(155, 52, 37, 37, this, "img/anger.png");
            this.prodNumber = new game.TextNumber(this, 192, 53, "/s", "bold 28pt lucida console ", "white", 6, "#5f3c0f", this.button.costStats, "prodRatePris");
            this.description = new game.TextWrap(this, 25, 95, this.button.description, "bold 18pt lucida console ", "white", 3, "#5f3c0f", 470, 28);
        } else if (produces == "exec") {
            this.prodIcon = new game.Background(155, 52, 37, 37, this, "img/coin.png");
            this.prodNumber = new game.TextNumber(this, 192, 53, "/s", "bold 28pt lucida console ", "white", 6, "#5f3c0f", this.button.costStats, "prodRateExec");
            this.consText = new game.Text(this, 25, 96, "Consumes:", "bold 18pt lucida console ", "white", 3, "#5f3c0f");
            this.consIcon = new game.Background(155, 94, 37, 37, this, "img/anger.png");
            this.consIcon.setVisible(this.visible);
            this.childObjects.push(this.consIcon);
            this.consNumber = new game.TextNumber(this, 192, 95, "/s", "bold 28pt lucida console ", "white", 6, "#5f3c0f", this.button.costStats, "prodRateExec");
            this.description = new game.TextWrap(this, 25, 137, this.button.description, "bold 18pt lucida console ", "white", 3, "#5f3c0f", 470, 28);
        }
        this.childObjects.push(this.prodIcon);
    } else {
        this.description = new game.TextWrap(this, 25, 65, this.button.description, "bold 18pt lucida console ", "white", 3, "#5f3c0f", 470, 28);
    }
    game.overlays.push(this);
}

//custom to ensure render order
game.Overlay.prototype.render = function (context) {
    this.background.render(context);
    this.coin.render(context);
    this.happy.render(context);
    this.description.render(context);
    this.costPP.render(context);
    this.costCult.render(context);
    if (this.prodText) {
        this.prodText.render(context);
        this.prodIcon.render(context);
        this.prodNumber.render(context);
        if (this.consText) {
            this.consText.render(context);
            this.consIcon.render(context);
            this.consNumber.render(context);
        }
    }
}

game.Overlay.prototype.update = function (context) {
    this.background.update(game.context);
    game.GameObject.prototype.update.call(this, context);
}

game.Overlay.prototype.setVisible = function (visible) {
    game.GameObject.prototype.setVisible.call(this, visible);
}

//a Button is a rectangular canvas element that can be clicked
//Buttons are invisible, but are coupled with background elements that move with them
game.Button=function(x,y,width,height,parent,imgSrc) {
    game.GameObject.call(this, x, y, width, height, parent);
    this.clicked = false;
    this.hovered = false;
    this.background = new game.Background(0, 0, width, height, this, imgSrc); //the background of the button
    this.childObjects.push(this.background);
}

//These prototype methods will be inherited by all buttons
game.Button.prototype.intersects=function(mouse) {
    var t = 2; //tolerance
    var xIntersect = (mouse.x + t) > this.x && (mouse.x - t) < this.x + this.width;
    var yIntersect = (mouse.y + t) > this.y && (mouse.y - t) < this.y + this.height;
    return  xIntersect && yIntersect;
}

game.Button.prototype.updateStats=function(context){
    //update whether the button has been clicked
    if (this.intersects(context.mouse)) {
        this.hovered = true;
        if (context.mouse.down) {
            this.clicked = true;
        } else {
            this.clicked = false;
        }
    } else {
        this.hovered = false;
    }

    if (!context.mouse.down) {
        this.clicked = false;
    }
}

game.Button.prototype.update = function(context) {
    var wasNotClicked = !this.clicked;
    this.updateStats(context);

    //check if after updating, the button is now clicked
    if (this.visible && this.clicked && wasNotClicked) {
        this.onClick();
    }
    
    this.background.update(context);
}

game.Button.prototype.render = function(context) {
    //Buttons are invisible interactible areas, do not render
    //Backgrounds should be drawn instead
    this.background.render(context);
    game.GameObject.prototype.render.call(this, context);
}

game.Button.prototype.move = function(x,y) {
    this.x=x;
    this.y=y;
    this.background.x=x;
    this.background.y=y;
}

game.Button.prototype.setVisible=function(visible) {
    this.visible=visible;
    this.background.setVisible(visible);
}

//Save button
//Not yet implemented
game.ButtonSave = function(x,y,width,height,parent,imgSrc) {
    game.Button.call(this,x,y,width,height,parent,imgSrc);
}

game.ButtonSave.prototype=Object.create(game.Button.prototype);
game.ButtonSave.prototype.constructor=game.ButtonSave;

game.ButtonSave.prototype.onClick = function(){
    for (var x=0; x<convNames.length;x++){
        localStorage.setItem("playerstats", "hi")
    }
}

//Now we're getting into the game logic
//A ToolButton is a type of Button that represents a Tool
//Tools, when purchased, affect the rate of production
//It has a Background(as per its superclass)
//toolStats holds the cost and rate of production of the tool, as well as the number
game.ToolButton = function (x, y, width, height, parent, bgString, title, toolStats, tabString, tab, description) {
    var _background = "img/" + tabString + "_tool_icons/" + tabString + "_" + bgString + ".png";
    game.Button.call(this, x, y, width, height, parent, _background);
    this.toolStats = toolStats;
    this.costStats = this.toolStats;
    this.costPPText = new game.TextNumber(this, 300, 55, "", "bold 28pt lucida console ", "white", 6, "#5f3c0f", this.toolStats, "costPP");
    this.costPPText.visible = this.visible;
    this.childObjects.push(this.costPPText);
    this.costCultText = new game.TextNumber(this, 450, 55, "", "bold 28pt lucida console ", "white", 6, "#5f3c0f", this.toolStats, "costCult");
    this.costCultText.visible = this.visible;
    this.childObjects.push(this.costCultText);
    this.numToolsText = new game.TextNumber(this, 150, 55, "", "bold 28pt lucida console ", "white", 6, "#5f3c0f", this.toolStats, "numTools");
    this.numToolsText.visible = this.visible;
    this.title = title;
    this.titleText = new game.Text(this, 150, 5, this.title, "bold 30pt lucida console ", "white", 6, "#5f3c0f");
    this.bgString = bgString;
    this.tabString = tabString;
    this.tab = tab;
    this.negBgSrc = _background.substring(0, _background.length - 4) + "_negative.png";
    this.negBackground = new game.Background(0, 0, this.width, this.height, this, this.negBgSrc);
    this.description = description;
    if (this.toolStats.prodRateCult > 0) {
        this.overlay = new game.Overlay(this, 500, 220, 580, -120, "cult");
    } else if (this.toolStats.prodRatePris > 0) {
        this.overlay = new game.Overlay(this, 500, 220, 580, -120, "pris");
    } else if (this.toolStats.prodRateExec > 0) {
        this.overlay = new game.Overlay(this, 500, 220, 580, -120, "exec");
    }
}

game.ToolButton.prototype = Object.create(game.Button.prototype);
game.ToolButton.prototype.constructor = game.ToolButton;

game.ToolButton.prototype.update = function (context) {
    this.overlay.update(context);
    if (this.hovered && this.tab.tabVisible) {
        this.overlay.setVisible(true);
    } else {
        this.overlay.setVisible(false);
    }
    if (this.tab.tabVisible) {
        this.negBackground.setVisible(true);
    } else {
        this.negBackground.setVisible(false);
    }
    game.Button.prototype.update.call(this, context);
    
    if (this.tab.tabVisible) {
        if (game.playerStats["prayerPoints"] > this.toolStats["costPP"] && game.playerStats["cultists"] > this.toolStats["costCult"]) {
            this.background.setVisible(true);
            this.negBackground.setVisible(false);
        } else {
            this.background.setVisible(false);
            this.negBackground.setVisible(true);
        }
    }
    for(var x=0;x<this.childObjects.length;x++) {
        this.childObjects[x].update(context);
    }
}

game.ToolButton.prototype.render = function (context) {
    this.negBackground.render(context);
    game.Button.prototype.render.call(this, context);
}

//When clicked, a ToolButton will buy one more of that tool, provided the cost is appropriate
game.ToolButton.prototype.onClick = function() {
    if(game.playerStats.prayerPoints>=Math.floor(this.toolStats.costPP) && game.playerStats.cultists>=Math.floor(this.toolStats.costCult)) {
        this.toolStats.numTools+=1;
        //Costs are stored as floats, but are used and displayed as ints
        game.playerStats.prayerPoints-=Math.floor(this.toolStats.costPP);
        game.playerStats.cultists-=Math.floor(this.toolStats.costCult);
        //Update the costs by a scaling factor
        this.toolStats.costPP*=game.playerStats.costPPMultiplier;
        this.toolStats.costCult*=game.playerStats.costCultMultiplier;
    }
}

game.ToolButton.prototype.setVisible=function(visible) {
    game.Button.prototype.setVisible.call(this, visible);
    this.costPPText.setVisible(visible);
    this.costCultText.setVisible(visible);
    this.numToolsText.setVisible(visible);
    this.titleText.setVisible(visible);
}

//An UpgradeButton has an effect on some game system
//Typically, this will be increasing the effectiveness of a Tool
//UpgradeButtons are smaller squares that have no text
//All description is in the overlay
//The cost of an UpgradeButton is in costStats
game.UpgradeButton=function(x,y,width,height,parent,bgString,costStats,toolStats,tabString, num, tab, description) {
    this.description=description;
    var _background = "img/" + tabString + "_upgrades/upgrade_" + bgString + num.toString() + ".png";
    game.Button.call(this,x,y,width,height,parent,_background);
    this.costStats=costStats;
    this.toolStats=toolStats;
    this.disabled=false;
    var negBgSrc=_background.substring(0,_background.length-4)+"_negative.png";
    this.negBackground=new game.Background(0,0,width,height,this,negBgSrc);
    this.negBackground.setVisible(true);
    this.tabString=tabString;
    this.bgString=bgString;
    this.tab=tab;
    this.num=num;
    this.overlay = new game.Overlay(this, 500, 250, 34, 45);
}

game.UpgradeButton.prototype=Object.create(game.Button.prototype);
game.UpgradeButton.prototype.constructor=game.UpgradeButton;

game.UpgradeButton.prototype.render=function(context){
    this.negBackground.render(context);
    game.Button.prototype.render.call(this,context);
}

//UpgradeButtons will have their applyUpgrade() methods coded in the game initialization
//It will then destroy itself, as Upgrades can only be bought once
game.UpgradeButton.prototype.onClick = function() {
    //this.applyUpgrade();
    if(game.playerStats.prayerPoints>=Math.floor(this.costStats.costPP) && game.playerStats.cultists>=Math.floor(this.costStats.costCult)) {
        //Costs are stored as floats, but are used and displayed as ints
        game.playerStats.prayerPoints-=Math.floor(this.costStats.costPP);
        game.playerStats.cultists-=Math.floor(this.costStats.costCult);
        this.toolStats.prodRateCult *= game.prodCultMultiplier;
        this.toolStats.prodRatePris *= game.prodPrisMultiplier;
        this.toolStats.prodRateExec *= game.prodExecMultiplier;
        this.costStats.costPP*=game.costUpgradeMultiplier;
        if (this.num < 3) {
            this.num++;
            this.background.img.src = "img/" + this.tabString + "_upgrades/upgrade_" + this.bgString + this.num.toString() + ".png";
            this.negBackground.img.src = this.background.img.src.substring(0, this.background.img.src.length - 4) + "_negative.png";
        } else {
            this.disabled = true;
            this.setVisible(false);
            this.overlay.setVisible(false);
        }
    }
}

game.UpgradeButton.prototype.update=function(context){
    this.overlay.update(context);
    if (this.hovered && this.tab.tabVisible && !this.disabled) {
        this.overlay.setVisible(true);
    } else{
        this.overlay.setVisible(false);
    }
    
    game.Button.prototype.update.call(this,context);
    if (game.playerStats.prayerPoints > this.costStats.costPP && game.playerStats.cultists > this.costStats.costCult) {
        if (this.tab.tabVisible) {
            this.setVisible(true);
        }
    } else {
    }
}
game.UpgradeButton.prototype.setVisible=function(visible) {
    if(!this.disabled) {
        this.visible=visible;
        this.background.setVisible(visible);
        this.negBackground.setVisible(visible);
    } else {
        this.visible=false;
        this.background.setVisible(false);
        this.negBackground.setVisible(false);
        this.overlay.setVisible(false);
    }
}

    

//a Sprite is a moving, animated object with no interactivity, that can be destroyed
game.Sprite = function (x, y, width, height, parent, xspeed, yspeed, imgSrc) {
    game.GameObject.call(this, x, y, width, height, parent);
    this.xspeed=xspeed;
    this.yspeed=yspeed;
    this.img=new Image();
    this.imgSrc=imgSrc; //source file of image
    this.img.src=this.imgSrc;
    this.destroy=false;
    this.visible=false;
    this.spriteCreated=false;
}

game.Sprite.prototype = Object.create(game.GameObject.prototype);
game.Sprite.prototype.constructor = game.Sprite;

game.Sprite.prototype.render = function(context) {
    if (this.visible) {
        context.drawImage(this.img,
                  this.x, this.y,
                  this.width, this.height);
    }
}

game.Sprite.prototype.update=function(context) {
    //speed is in pixels per second
    //assume 60 FPS
    this.x+=this.xspeed/60;
    this.y+=this.yspeed/60;
}

game.Sprite.prototype.setVisible=function(visible) {
    this.visible=visible;
}

//A hardcoded sprite of a climber that is animated 
game.SpriteClimber=function(x,y,width,height,parent,xspeed,yspeed,imgSrc,maxIndex,imgScale,color) {
    //sprite image urls start with their color
    game.Sprite.call(this,x,y,width,height,parent,xspeed,yspeed,"img/sprites/"+color+imgSrc);
    //keep track of the current image index
    this.imageIndex=0;
    this.maxIndex=maxIndex;
    //number of frames the same image has been on screen for
    this.numFrames=0;
    //this.maxFramesSame=game.maxFramesSame;
    this.maxFramesSame=2;
    this.imgScale=imgScale;
    this.color=color;
    this.spriteCreated=true;
}

game.SpriteClimber.prototype=Object.create(game.Sprite.prototype);
game.SpriteClimber.prototype.constructor=game.SpriteClimber;

game.SpriteClimber.prototype.update=function(context) {
    game.Sprite.prototype.update.call(this);
    this.numFrames++;
    if(this.numFrames>=this.maxFramesSame) {
        //switch the image
        this.imageIndex+=1;
        if(this.imageIndex>=this.maxIndex) {
            this.imageIndex=0;
        }
        //reset the same frame counter
        this.numFrames-=this.maxFramesSame;
    }
    if(this.y<300) {
        this.destroy=true;
    }
}

game.SpriteClimber.prototype.render = function(context) {
    //SpriteClimber's image has multiple sprites of animation
    //Based on the imageIndex, cut out the appropriate sprite
    if(this.visible) {
        context.drawImage(this.img,
                  this.width*this.imageIndex, 0,
                  this.width, this.height,
                  this.x, this.y,
                  this.width*this.imgScale, this.height*this.imgScale);
    }
}

game.SpriteClimber.prototype.onDestroy=function() {
    var head=new game.SpriteHead(1405+40*Math.random(),350,135,135,null,0,30,"head.png",1.2+.5*Math.random(),this.color);
    head.setVisible(true);
    game.sprites.unshift(head); //behind the cloud
}

game.SpriteHead=function(x,y,width,height,parent,xspeed,yspeed,imgSrc,rotationSpd,color) {
    game.Sprite.call(this,x,y,width,height,parent,xspeed,yspeed,"img/sprites/"+color+imgSrc);
    this.rotationSpd=rotationSpd;
    this.rotationAngle=0;
    this.color=color;
    this.imgScale=0.33;
    this.destroy=false;
}

game.SpriteHead.prototype=Object.create(game.Sprite.prototype);
game.SpriteHead.prototype.constructor=game.SpriteHead;

game.SpriteHead.prototype.update=function(context) {
    game.Sprite.prototype.update.call(this);
    this.rotationAngle+=this.rotationSpd/60;
    if(this.y>800) {
        this.destroy=true;
    }
}

game.SpriteHead.prototype.render=function(context) {
    context.save();
    context.translate(this.x,this.y);
    context.rotate(this.rotationAngle);
    if(this.visible) {
        context.drawImage(this.img,
                  -this.width/2*this.imgScale,-this.height/2*this.imgScale,
                  this.width*this.imgScale, this.height*this.imgScale);
    }
    context.restore();
}

game.SpriteHead.prototype.onDestroy=function() {
    //pass
}

game.SpriteCloud=function(x,y,width,height,parent,xspeed,yspeed,imgSrc,maxFrames,maxDisplacement) {
    game.Sprite.call(this,x,y,width,height,parent,xspeed,yspeed,imgSrc);
    this.numFrames=0;
    this.maxFrames=maxFrames;
    this.position=0;
    this.maxDisplacement=maxDisplacement;
    this.direction=1;
}

game.SpriteCloud.prototype=Object.create(game.Sprite.prototype);
game.SpriteCloud.prototype.constructor=game.SpriteCloud;

//SpriteClouds just bob, up and down by 1 pixel
game.SpriteCloud.prototype.update=function(context) {
    this.numFrames+=1;
    if(this.numFrames>=this.maxFrames) {
        this.numFrames-=this.maxFrames;
        this.y-=this.position;
        this.position+=this.direction;
        if(this.position<=0 || this.position>=this.maxDisplacement) {
            this.direction=-this.direction;
        }
        this.y+=this.position;
    }
}

//A Scrollbar is a Background with another movable Background on top of it
//When dragged with the mouse, a Scrollbar translates
game.Scrollbar=function(x,y,width,height,parent,backgroundBar,backgroundScroller,gameObjects) {
    
}

//A Tab is a button that, when clicked, toggles the visibility(and interactivity) of a set of game objects
game.Tab=function(x,y,width,height,parent,background,gameObjects) {
    game.Button.call(this,x,y,width,height,parent,background);
    this.gameObjects=gameObjects;
    this.tabVisible=false;
}

game.Tab.prototype=Object.create(game.Button.prototype);
game.Tab.prototype.constructor=game.Tab;

game.Tab.prototype.onClick=function() {
    //needs to shut off all other tabs
    for(var x=0;x<game.tabs.length;x++) {
        //shut off tab
        game.tabs[x].setTabVisible(false);
    }
    this.setTabVisible(true);
}

game.Tab.prototype.setTabVisible=function(visible){
    this.tabVisible = visible;
    //turn on this tab
    for (var x = 0; x < this.gameObjects.length; x++) {
        this.gameObjects[x].setVisible(visible);
    }
}

//An Achievement is a popup that has a trigger method checkCondition()
//Each update, checkCondition is checked
//if it is met, the Achievement pops up, then destroys itself
game.Achievement=function(x,y,imgSrc,text) {
    this.x=x;
    this.y=y;
    this.ySpeed = 0;//-20;
    this.minY=900;
    this.width=300;
    this.height=60;
    this.background=new game.Background(this.x,this.y,this.width,this.height,null,"img/description.png");
    this.achievementIcon=new game.Background(this.x+5,this.y+5,50,50,null,imgSrc);
    this.text=text;
    this.textObject = new game.Text(this.background, 60, 10, this.text, "bold 20pt lucida console", "white", 6, "#5f3c0f");
    this.active=false;
    this.activeFrames=0;
    this.maxActiveFrames=240;
    this.destroy=false;
}

game.Achievement.prototype.update=function(context) {
    this.background.update(context);
    this.achievementIcon.update(context);
    this.active=this.checkCondition();
    if(this.active) {
        this.setVisible(true);
        this.activeFrames++;
        if(this.activeFrames>=this.maxActiveFrames) {
            this.destroy=true;
        }
        if(this.y>this.minY) {
            this.y+=this.ySpeed/60;
        }
    } else {
        this.setVisible(false);
    }
}

game.Achievement.prototype.setVisible=function(visible) {
    this.background.setVisible(visible);
    this.achievementIcon.setVisible(visible);
}

game.Achievement.prototype.render=function(context) {
    if(this.active) {
        this.background.render(context);
        this.achievementIcon.render(context);
    }
}


window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame     || 
        window.webkitRequestAnimationFrame  || 
        window.mozRequestAnimationFrame     || 
        window.oRequestAnimationFrame       || 
        window.msRequestAnimationFrame      ||
    function(callback) {
    //lock to 60 FPS
      window.setTimeout(callback, 1000 / 60);
    };
})();

window.cancelRequestAnimFrame = (function(callback) {
	return window.cancelAnimationFrame            ||
		window.webkitCancelRequestAnimationFrame  ||
		window.mozCancelRequestAnimationFrame     ||
		window.oCancelRequestAnimationFrame       ||
		window.msCancelRequestAnimationFrame      ||
		clearTimeout
})();

game.update = function () {
    //clear the screen
    game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    //update all objects to reflect the new game state
    for(var x=0;x<game.buttons.length;x++) {
        game.buttons[x].update(game.context);
    }

    for(var x=0;x<game.backgrounds.length;x++) {
        game.backgrounds[x].update(game.context);
    }
    
    for(var x=0;x<game.tabs.length;x++) {
        game.tabs[x].update(game.context);
    }
    
    //update all stats
    //recalculate all the production rates
    var conversionRate=0;
    for(var x=0;x<game.conversionToolButtons.length;x++) {
        var tempToolStats=game.conversionToolButtons[x].toolStats;
        conversionRate+=tempToolStats.prodRateCult*tempToolStats.numTools;
    }
    
    var captureRate=0;
    for(var x=0;x<game.captureToolButtons.length;x++) {
        var tempToolStats=game.captureToolButtons[x].toolStats;
        captureRate+=tempToolStats.prodRatePris*tempToolStats.numTools;
    }
    
    var executionRate=0;
    for(var x=0;x<game.executionToolButtons.length;x++) {
        var tempToolStats=game.executionToolButtons[x].toolStats;
        executionRate+=tempToolStats.prodRateExec*tempToolStats.numTools;
    }
    
    game.playerStats.prodRateCult=conversionRate;
    game.playerStats.prodRateExec=executionRate;
    
    game.playerStats.prodRatePris=captureRate-executionRate;
    //if there are not enough prisoners, cannot execute them
    var realExecutionRate=0;
    if(game.playerStats.prisoners>0||game.playerStats.prodRatePris>0) {
        realExecutionRate=executionRate;
    } else {
        realExecutionRate=captureRate;
    }
    
    game.playerStats.totalExecuted+=realExecutionRate/60;
    game.playerStats.prodRatePris=captureRate-realExecutionRate;
    
    //check sun happiness
    var sunMultiplier=1.5;//normally bonus
    if(realExecutionRate<0.75*Math.max(executionRate,captureRate)) {
        if(realExecutionRate>0.25*Math.max(executionRate,captureRate)) {
            sunMultiplier=1-(0.75*Math.max(executionRate,captureRate)-realExecutionRate)/Math.max(executionRate,captureRate);
        } else {
            sunMultiplier=0.5;
        }
    } 
    //update the mood of the sun
    if(sunMultiplier==1.5) {
        game.sun.mood="happy";
    } else {
        if(sunMultiplier>0.75) {
            game.sun.mood="normal";
        } else {
            if(sunMultiplier>0.5) {
                game.sun.mood="sad";
            } else {
                game.sun.mood="angry";
            }
        }
    }
        
    //apply cultist rate
    game.playerStats.cultists+=game.playerStats.prodRateCult/60;
    if (game.playerStats.cultists>game.playerStats.totalCultists){
        game.playerStats.totalCultists=game.playerStats.cultists;
    }
    
    //apply prisoner rate
    game.playerStats.prisoners+=game.playerStats.prodRatePris/60;
    if(game.playerStats.prisoners<0) {
        game.playerStats.prisoners=0;
    }
    
    //apply PP rate
   game.playerStats.totalPrayerPoints+=realExecutionRate/60*game.playerStats.ppMultiplier*sunMultiplier;  game.playerStats.prayerPoints+=realExecutionRate/60*game.playerStats.ppMultiplier*sunMultiplier;    
    
    //check all achievements
    for(var x=0;x<game.achievements.length;x++) {
        game.achievements[x].update(game.context);
    }
    //check all achievements for destroy
    var y=game.achievements.length-1;
    while(y>=0) {
        if(game.achievements[y].destroy) {
            game.achievements[y].setVisible(false);
            game.achievements.splice(y,1);
        }
        y--;
    }
    
    //render all objects in order
    for(var x=0;x<game.backgrounds.length;x++) {
        game.backgrounds[x].render(game.context);
    }
    
    //render dynamic sprites(backgrounds since they are static) on panels
    var yLocs=[267,384,500,617,734,849,964];
    var convNames=['book','soapbox','speaker','podium','camcorder','computer','laptop'];
    var convStats=[game.toolStats.bookStats,game.toolStats.soapboxStats,game.toolStats.speakerStats,
game.toolStats.podiumStats,
game.toolStats.camcorderStats,
game.toolStats.computerStats,
game.toolStats.laptopStats];
    var convWidths=[29,50,51,43,47,75,60];
    var convHeights=[53,82,78,50,69,67,63];
    
    var capNames=['net','lasso','trapdoor','van','invasion','phaser','cloning'];
    var capStats=[game.toolStats.netStats,
game.toolStats.lassoStats,
game.toolStats.trapdoorStats,
game.toolStats.vanStats,
game.toolStats.invasionStats,
game.toolStats.phaserStats,
game.toolStats.cloningStats];
    var capWidths=[55,63,54,85,50,40,44];
    var capHeights=[65,66,33,55,66,72,82];

    var execStats=[game.toolStats.knifeStats,
game.toolStats.cleaverStats,
game.toolStats.axeStats,
game.toolStats.bladeStats,
game.toolStats.guillotineStats,
game.toolStats.sawStats,
game.toolStats.lightsaberStats];
    var execNames=['knife','cleaver','axe','blade','guillotine','saw','lightsaber'];
    var execWidths=[63,69,93,108,107,57,54];
    var execHeights=[70,73,73,108,99,73,74];
    
    if(game.conversionTab.tabVisible) {
        for(var x=0;x<yLocs.length;x++) {
            var numIter=Math.min(15,convStats[x].numTools);
            for(var y=game.numConvSprites[x];y<numIter;y++) {
                var tempSprite=new game.Sprite(646+y*41,yLocs[x]+20*(y%2),convWidths[x],convHeights[x],null,0,0,"img/conversion_panel_icons/panel_"+convNames[x]+"_person"+(y%3+1)+".png");
                tempSprite.setVisible(true);
                this.sprites.unshift(tempSprite);
                this.conversionObjects.push(tempSprite);
                game.numConvSprites[x]+=1;
            }
        }
    } else if(game.captureTab.tabVisible) {
        for(var x=0;x<yLocs.length;x++) {
            var numIter=Math.min(15,capStats[x].numTools);
            for(var y=game.numCapSprites[x];y<numIter;y++) {
                var tempSprite=new game.Sprite(646+y*41,yLocs[x]+20*(y%2),capWidths[x],capHeights[x],null,0,0,"img/capture_panel_icons/panel_capture_"+capNames[x]+"_person"+(y%3+1)+".png");
                tempSprite.setVisible(true);
                this.sprites.unshift(tempSprite);
                this.captureObjects.push(tempSprite);
                game.numCapSprites[x]+=1;
            }
        }
    } else if(game.executionTab.tabVisible) {
        for(var x=0;x<yLocs.length;x++) {
            var numIter=Math.min(15,execStats[x].numTools);
            for(var y=game.numExecSprites[x];y<numIter;y++) {
                var tempSprite=new game.Sprite(646+y*41,yLocs[x]+20*(y%2),execWidths[x],execHeights[x],null,0,0,"img/execution_panel_icons/panel_execution_"+execNames[x]+"_person"+(y%3+1)+".png");
                tempSprite.setVisible(true);
                this.sprites.unshift(tempSprite);
                this.executionObjects.push(tempSprite);
                game.numExecSprites[x]+=1;
            }
        }
    }
    
    
    for(var x=0;x<game.buttons.length;x++) {
        game.buttons[x].render(game.context);
    }
    
    for(var x=0;x<game.tabs.length;x++) {
        game.tabs[x].render(game.context);
    }
    
    //render the sun
    game.sun.img.src=game.sun.imgSrc+game.sun.mood+".png";
    game.context.drawImage(game.sun.img,game.sun.x,game.sun.y,game.sun.img.width,game.sun.img.height);
    
    //update and render sprites last for performance
    for(var x=0;x<game.sprites.length;x++) {
        game.sprites[x].update(game.context);
    }
    
    //Iterate backwards through array, so indexes of remaining sprites don't change on delete
    var x=game.sprites.length-1;
    while(x>=0) {
        if(game.sprites[x].destroy) {
            
            if(game.sprites[x].spriteCreated) {
                game.sprites[x].onDestroy();
                game.sprites.splice(x+1,1);
            } else {
                game.sprites[x].onDestroy();
                game.sprites.splice(x,1);
            }
        } 
        x--;
    }
    
    for(var x=0;x<game.sprites.length;x++) {
        game.sprites[x].render(game.context);
    }
    
    //render all achievements(if active)
    for(var x=0;x<game.achievements.length;x++) {
        game.achievements[x].render(game.context);
    }
    
    for (var x=0; x<game.overlays.length; x++){
        game.overlays[x].render(game.context);
    }
    
    //update and render lava
    game.lava.update(game.context);
    game.lava.render(game.context);
    
    //update and render stat tracker panel
    game.trackerPanel.update(game.context);
    game.trackerPanel.render(game.context);
    game.cultistsIcon.render(game.context);
    game.prayerPointsIcon.render(game.context);
    game.prisonersIcon.render(game.context);
    
    //spawn climbers
    game.climberFrames+=1;
    game.climberCount+=realExecutionRate/60;
    if(game.climberCount>=1) {
        if(game.climberFrames>=game.maxClimberFrames) {
            game.climberFrames-=game.maxClimberFrames;
            game.climberCount-=1;
            var newClimber=new game.SpriteClimber(1750+30*Math.random(),800+30*Math.random(),136,328,null,-50,-100,"climb_strip16.png",16,0.33,game.climberColors[Math.floor(game.climberColors.length*Math.random())]);
            newClimber.setVisible(true);
            game.sprites.splice(game.sprites.length-3,0,newClimber);
        }
    }   
    
    game.playerStats.time = ((new Date()).getTime()-game.startTime)/1000;
    
    // request new frame
     requestAnimFrame(function() {
      game.update(game.context);
    });
}

// #####################################################################################################
//PlayerStats is an array that holds all of the player's statistics
game.playerStats=[];
//Initialize all values
var INITIAL_PRAYERPOINTS = 50000;
var INITIAL_CULTISTS = 500;
var INITIAL_PRISONERS = 10000;

game.playerStats.prayerPoints=INITIAL_PRAYERPOINTS;
game.playerStats.cultists=INITIAL_CULTISTS;
game.playerStats.prisoners=INITIAL_PRISONERS;
game.playerStats.prodRateCult=0;
game.playerStats.prodRatePris=0;
game.playerStats.prodRateExec=0;

game.playerStats.totalPrayerPoints=INITIAL_PRAYERPOINTS;
game.playerStats.totalCultists=INITIAL_CULTISTS;
game.playerStats.totalExecuted =0;
game.playerStats.statFollowerRate=0;
game.playerStats.time=0;

game.playerStats.ppMultiplier=4;
game.playerStats.costPPMultiplier=1.1;
game.playerStats.costCultMultiplier = 1.1;
game.costUpgradeMultiplier = 10;

game.prodCultMultiplier = 1.5;
game.prodPrisMultiplier = 1.5;
game.prodExecMultiplier = 10;

// container for tool statistics
game.toolStats = [];

game.toolStats.bookStats=new game.ToolStats(10,1,.1,0,0,0);
game.toolStats.soapboxStats=new game.ToolStats(100,1,1,0,0,0);
game.toolStats.speakerStats=new game.ToolStats(1000,1,10,0,0,0);
game.toolStats.podiumStats=new game.ToolStats(10000,1,100,0,0,0);
game.toolStats.camcorderStats=new game.ToolStats(100000,1,1000,0,0,0);
game.toolStats.computerStats=new game.ToolStats(1000000,1,10000,0,0,0);
game.toolStats.laptopStats=new game.ToolStats(10000000,1,100000,0,0,0);

game.toolStats.netStats=new game.ToolStats(10,10,0,1,0,0);
game.toolStats.lassoStats=new game.ToolStats(100,100,0,10,0,0);
game.toolStats.trapdoorStats=new game.ToolStats(1000,1000,0,100,0,0);
game.toolStats.vanStats=new game.ToolStats(10000,10000,0,1000,0,0);
game.toolStats.invasionStats=new game.ToolStats(100000,100000,0,10000,0,0);
game.toolStats.phaserStats=new game.ToolStats(1000000,1000000,0,100000,0,0);
game.toolStats.cloningStats=new game.ToolStats(10000000,10000000,0,1000000,0,0);

game.toolStats.knifeStats=new game.ToolStats(5,5,0,0,1,0);
game.toolStats.cleaverStats=new game.ToolStats(50,50,0,0,8,0);
game.toolStats.axeStats=new game.ToolStats(500,500,0,0,64,0);
game.toolStats.bladeStats=new game.ToolStats(5000,5000,0,0,512,0);
game.toolStats.guillotineStats=new game.ToolStats(50000,50000,0,0,2048,0);
game.toolStats.sawStats=new game.ToolStats(500000,500000,0,0,16384,0);
game.toolStats.lightsaberStats=new game.ToolStats(5000000,5000000,0,0,131072,0);

//container for upgrade stats
game.upgradeStats = [];

game.upgradeStats.bookUpgradeCosts=new game.CostStats(100,0);
game.upgradeStats.soapboxUpgradeCosts=new game.CostStats(1000,0);
game.upgradeStats.speakerUpgradeCosts=new game.CostStats(10000,0);
game.upgradeStats.podiumUpgradeCosts=new game.CostStats(100000,0);
game.upgradeStats.camcorderUpgradeCosts=new game.CostStats(1000000,0);
game.upgradeStats.computerUpgradeCosts=new game.CostStats(10000000,0);
game.upgradeStats.laptopUpgradeCosts = new game.CostStats(100000000, 0);

game.upgradeStats.netUpgradeCosts = new game.CostStats(100, 0);
game.upgradeStats.lassoUpgradeCosts = new game.CostStats(1000, 0);
game.upgradeStats.trapdoorUpgradeCosts = new game.CostStats(10000, 0);
game.upgradeStats.vanUpgradeCosts = new game.CostStats(100000, 0);
game.upgradeStats.invasionUpgradeCosts = new game.CostStats(1000000, 0);
game.upgradeStats.phaserUpgradeCosts = new game.CostStats(10000000, 0);
game.upgradeStats.cloningUpgradeCosts = new game.CostStats(100000000, 0);

game.upgradeStats.knifeUpgradeCosts = new game.CostStats(100, 0);
game.upgradeStats.cleaverUpgradeCosts = new game.CostStats(1000, 0);
game.upgradeStats.axeUpgradeCosts = new game.CostStats(10000, 0);
game.upgradeStats.bladeUpgradeCosts = new game.CostStats(100000, 0);
game.upgradeStats.guillotineUpgradeCosts = new game.CostStats(1000000, 0);
game.upgradeStats.sawUpgradeCosts = new game.CostStats(10000000, 0);
game.upgradeStats.lightsaberUpgradeCosts = new game.CostStats(100000000, 0);

var convNames=['book','soapbox','speaker','podium','camcorder','computer','laptop'];
    var convStats=[game.toolStats.bookStats, game.toolStats.soapboxStats, game.toolStats.speakerStats,
game.toolStats.podiumStats,
game.toolStats.camcorderStats,
game.toolStats.computerStats,
game.toolStats.laptopStats];

var capNames=['net','lasso','trapdoor','van','invasion','phaser','cloning'];
var capStats=[game.toolStats.netStats,
    game.toolStats.lassoStats,
    game.toolStats.trapdoorStats,
    game.toolStats.vanStats,
    game.toolStats.invasionStats,
    game.toolStats.phaserStats,
    game.toolStats.cloningStats];

var execNames=['knife','cleaver','axe','blade','guillotine','saw','lightsaber'];
var execStats=[game.toolStats.knifeStats,
    game.toolStats.cleaverStats,
    game.toolStats.axeStats,
    game.toolStats.bladeStats,
    game.toolStats.guillotineStats,
    game.toolStats.sawStats,
    game.toolStats.lightsaberStats];


game.numConvSprites=[0,0,0,0,0,0,0];
game.numCapSprites=[0,0,0,0,0,0,0];
game.numExecSprites=[0,0,0,0,0,0,0];

//Controls the mood of the sun
game.sun=[];
game.sun.mood="happy";
game.sun.x=1650;
game.sun.y=58;
game.sun.img=new Image();
game.sun.nextImg=new Image();
game.sun.imgSrc="img/sunny/sun_";
game.sun.imgIndex=0;
game.sun.maxIndex=4;
game.sun.frameCount=0;
game.sun.maxFrames=80;
game.sun.img.src=game.sun.imgSrc+game.sun.mood+game.sun.imgIndex+".png";
game.sun.nextImg.src=game.sun.imgSrc+game.sun.mood+(game.sun.imgIndex+1)+".png";

//These are the reference resolutions for all images
//Images are drawn scaled based on these
game.nativeResolution=[];
game.nativeResolution.width=1920;
game.nativeResolution.height=1080;
game.widthScale=window.innerWidth/game.nativeResolution.width;
game.heightScale=window.innerHeight/game.nativeResolution.height;

//This array holds all created backgrounds that are independent of other game objects
game.backgrounds=[];

//This array holds all buttons
game.buttons=[];

//This array holds all ToolButtons, which are still in Buttons
game.conversionToolButtons=[];
game.captureToolButtons=[];
game.executionToolButtons=[];

//This array holds 
game.conversionUpgradeButtons=[];
game.captureUpgradeButtons=[];
game.executionUpgradeButtons=[];

//This array holds all of the tabs
game.tabs=[];

//This array holds all of the sprites
game.sprites=[];

//This array holds all of the overlays, so they will be drawn last on top of everything
game.overlays=[];

//This array holds all of the achievements
game.achievements=[];

game.cloud = new game.SpriteCloud(1330, 230, 400, 300, null, 0, 0, "img/cloudkun.png", 30, 1);
game.cloud.setVisible(true);
game.sprites.push(game.cloud);

//In retrospect, bobbing up and down is more useful than it seemed at first
game.lava = new game.SpriteCloud(1369, 740, 104, 337, null, 0, 0, "img/lava/volcano_lava.png", 125, 5);
game.lava.setVisible(true);
//game.sprites.push(game.lava);



//controls the spawning of climbers
game.climberCount=0;
game.climberFrames=0;
game.maxClimberFrames=2;
game.climberColors=["red","blue","gold"];

//This master background is behind everything
//It holds objects that will always appear on the screen
game.masterBackground=new game.Background(0,0,1920,1080,null,"img/background.png");

//Create the tracker area at the bottom right
game.trackerPanel=new game.Background(1365,935,554,119,null,"img/money.png");
//Create the text number tracker for prayerPoints
game.prayerPointsText=new game.TextNumber(game.trackerPanel,70,45,"","bold 24pt lucida console ","white",6,"#5f3c0f",game.playerStats,"prayerPoints");
//Create the icon for prayerPoints
game.prayerPointsIcon=new game.Background(1400,977,37,37,null,"img/coin.png");
game.prayerPointsIcon.setVisible(true);
//game.backgrounds.push(game.prayerPointsIcon);

//Create the text number tracker for cultists
game.cultistsText=new game.TextNumber(game.trackerPanel,240,45,"","bold 24pt lucida console ","white",6,"#5f3c0f",game.playerStats,"cultists");
//Create the icon for cultists
game.cultistsIcon=new game.Background(1566,977,37,37,null,"img/happy.png");
game.cultistsIcon.setVisible(true);
//game.backgrounds.push(game.cultistsIcon);

//Create the text number tracker for prisoners
game.prisonersText=new game.TextNumber(game.trackerPanel,402,45,"","bold 24pt lucida console ","white",6,"#5f3c0f",game.playerStats,"prisoners");
//Create the icon for prisoners
game.prisonersIcon=new game.Background(1729,977,37,37,null,"img/anger.png");
game.prisonersIcon.setVisible(true);
//game.backgrounds.push(game.prisonersIcon);
//unshift to put panel behind tracker icons
game.trackerPanel.setVisible(true);
//game.backgrounds.unshift(game.trackerPanel);

game.guard=new game.Background(1850,840,75,140,null,"img/volcano_guard.png");
game.guard.setVisible(true);
game.backgrounds.unshift(game.guard);

game.mountainBackground=new game.Background(1470,395,452,690,null,"img/volcano_mountain.png");
game.mountainBackground.setVisible(true);
game.backgrounds.unshift(game.mountainBackground);

game.masterBackground.setVisible(true);
//unshift puts the master background to the front of the list
//so it will be drawn first and other backgrounds will draw on top of it
game.backgrounds.unshift(game.masterBackground);

// ####################################################################################################

//Create the lines in between panels
//This line is above the rest, on the left.
var panelLine = new game.Background(-73, 131, 648, 17, null, "img/panel_line.png");
panelLine.setVisible(true);
game.backgrounds.push(panelLine);

panelLineYValues = [250, 365, 482, 598, 715, 832, 946, 1061];

//Create the lines between the tools
for (var i = 0; i < panelLineYValues.length; i++) {
    panelLine = new game.Background(-73, panelLineYValues[i], 648, 17, null, "img/panel_line.png");
    panelLine.setVisible(true);
    game.backgrounds.push(panelLine);
}

//Create the lines between the panels showing cultists with tools
for (var i = 0; i < panelLineYValues.length; i++) {
    panelLine = new game.Background(645, panelLineYValues[i], 649, 17, null, "img/panel_line.png");
    panelLine.setVisible(true);
    game.backgrounds.push(panelLine);
}

//Create the objects that will go in the conversion tab
game.conversionHeader=new game.Background(0,0,584,126,null,"img/headers/conversion.png");
game.conversionHeader.setVisible(true);
game.backgrounds.push(game.conversionHeader);

game.conversionObjects=[];
game.conversionObjects.push(game.conversionHeader);

game.conversionTab=new game.Tab(680,137,113,108,null,"img/tab_buttons/conversion_button.png",game.conversionObjects);
game.conversionTab.setVisible(true);
game.tabs.push(game.conversionTab);

//These are all the conversion buttons
var buttonConversionBook=new game.ToolButton(0,267,580,98,null,"book","BOOK",game.toolStats.bookStats,"conversion", game.conversionTab, "50 Shades of Sunlight");
buttonConversionBook.setVisible(true);
game.buttons.push(buttonConversionBook);
game.conversionToolButtons.push(buttonConversionBook);

var buttonConversionSoapbox=new game.ToolButton(0,384,580,98,null,"soapbox","SOAPBOX",game.toolStats.soapboxStats,"conversion", game.conversionTab,"Your own personal moral elevator.");
buttonConversionSoapbox.setVisible(true);
game.buttons.push(buttonConversionSoapbox);
game.conversionToolButtons.push(buttonConversionSoapbox);

var buttonConversionSpeaker=new game.ToolButton(0,500,580,98,null,"speaker","LOUDSPEAKER",game.toolStats.speakerStats,"conversion",game.conversionTab,"For the hard of hearing. Because they will be, after hearing you.");
buttonConversionSpeaker.setVisible(true);
game.buttons.push(buttonConversionSpeaker);
game.conversionToolButtons.push(buttonConversionSpeaker);

var buttonConversionPodium=new game.ToolButton(0,617,580,98,null,"podium","PODIUM",game.toolStats.podiumStats,"conversion",game.conversionTab,"You've bought a spot in your local election. Turns out it was pretty cheap.");
buttonConversionPodium.setVisible(true);
game.buttons.push(buttonConversionPodium);
game.conversionToolButtons.push(buttonConversionPodium);

var buttonConversionCamcorder=new game.ToolButton(0,734,580,98,null,"camcorder","CAMCORDER",game.toolStats.camcorderStats,"conversion",game.conversionTab,"Now you can show your face to all the people in the world who don't care about you.");
buttonConversionCamcorder.setVisible(true);
game.buttons.push(buttonConversionCamcorder);
game.conversionToolButtons.push(buttonConversionCamcorder);

var buttonConversionComputer=new game.ToolButton(0,849,580,98,null,"computer","COMPUTER",game.toolStats.computerStats,"conversion",game.conversionTab,"A behemoth of a machine, this quad-core Titan still doesn't help you win arguments on the Internet.");
buttonConversionComputer.setVisible(true);
game.buttons.push(buttonConversionComputer);
game.conversionToolButtons.push(buttonConversionComputer);

var buttonConversionLaptop=new game.ToolButton(0,964,580,98,null,"laptop","LAPTOP",game.toolStats.laptopStats,"conversion",game.conversionTab,"All the convenience of arguing with people who will never understand you, to go!");
buttonConversionLaptop.setVisible(true);
game.buttons.push(buttonConversionLaptop);
game.conversionToolButtons.push(buttonConversionLaptop);

for(var x=0;x<game.conversionToolButtons.length;x++) {
    game.conversionObjects.push(game.conversionToolButtons[x]);
}

game.conversionPanels=[];

//These are all the conversion panels
var panelConversionBook=new game.Background(647,267,647,100,null,"img/conversion_panels/panel_book.png");
panelConversionBook.setVisible(true);
game.backgrounds.push(panelConversionBook);
game.conversionPanels.push(panelConversionBook);

var panelConversionSoapbox=new game.Background(647,384,647,100,null,"img/conversion_panels/panel_soapbox.png");
panelConversionSoapbox.setVisible(true);
game.backgrounds.push(panelConversionSoapbox);
game.conversionPanels.push(panelConversionSoapbox);

var panelConversionSpeaker=new game.Background(647,500,647,100,null,"img/conversion_panels/panel_speaker.png");
panelConversionSpeaker.setVisible(true);
game.backgrounds.push(panelConversionSpeaker);
game.conversionPanels.push(panelConversionSpeaker);

var panelConversionPodium=new game.Background(647,617,647,100,null,"img/conversion_panels/panel_podium.png");
panelConversionPodium.setVisible(true);
game.backgrounds.push(panelConversionPodium);
game.conversionPanels.push(panelConversionPodium);

var panelConversionCamcorder=new game.Background(647,734,647,100,null,"img/conversion_panels/panel_camcorder.png");
panelConversionCamcorder.setVisible(true);
game.backgrounds.push(panelConversionCamcorder);
game.conversionPanels.push(panelConversionCamcorder);

var panelConversionComputer=new game.Background(647,849,647,100,null,"img/conversion_panels/panel_computer.png");
panelConversionComputer.setVisible(true);
game.backgrounds.push(panelConversionComputer);
game.conversionPanels.push(panelConversionComputer);

var panelConversionLaptop=new game.Background(647,964,647,100,null,"img/conversion_panels/panel_laptop.png");
panelConversionLaptop.setVisible(true);
game.backgrounds.push(panelConversionLaptop);
game.conversionPanels.push(panelConversionLaptop);

for(var x=0;x<game.conversionPanels.length;x++) {
    game.conversionObjects.push(game.conversionPanels[x]);
}

//These are all the upgrade buttons
var buttonConversionUpgradeBook=new game.UpgradeButton(-1,150,85,98,null,"book",game.upgradeStats.bookUpgradeCosts,game.toolStats.bookStats, "conversion", 1, game.conversionTab, "Increases the conversion rate of books by 1.5");
buttonConversionUpgradeBook.setVisible(true);
game.buttons.push(buttonConversionUpgradeBook);
game.conversionUpgradeButtons.push(buttonConversionUpgradeBook);

var buttonConversionUpgradeSoapbox=new game.UpgradeButton(82,150,85,98,null, "soapbox",game.upgradeStats.soapboxUpgradeCosts,game.toolStats.soapboxStats, "conversion", 1, game.conversionTab, "Increases the conversion rate of soapbox by 1.5");
buttonConversionUpgradeSoapbox.setVisible(true);
game.buttons.push(buttonConversionUpgradeSoapbox);
game.conversionUpgradeButtons.push(buttonConversionUpgradeSoapbox);

var buttonConversionUpgradeSpeaker=new game.UpgradeButton(165,150,85,98,null,"speaker",game.upgradeStats.speakerUpgradeCosts,game.toolStats.speakerStats, "conversion", 1, game.conversionTab,"Increases the conversion rate of speaker by 1.5");
buttonConversionUpgradeSpeaker.setVisible(true);
game.buttons.push(buttonConversionUpgradeSpeaker);
game.conversionUpgradeButtons.push(buttonConversionUpgradeSpeaker);

var buttonConversionUpgradePodium=new game.UpgradeButton(247,150,85,98,null,"podium",game.upgradeStats.podiumUpgradeCosts,game.toolStats.podiumStats, "conversion", 1, game.conversionTab, "Increases the conversion rate of podium by 1.5");
buttonConversionUpgradePodium.setVisible(true);
game.buttons.push(buttonConversionUpgradePodium);
game.conversionUpgradeButtons.push(buttonConversionUpgradePodium);

var buttonConversionUpgradeCamcorder=new game.UpgradeButton(329,150,85,98,null, "camcorder",game.upgradeStats.camcorderUpgradeCosts,game.toolStats.camcorderStats, "conversion", 1, game.conversionTab, "Increases the conversion rate of camcorder by 1.5");
buttonConversionUpgradeCamcorder.setVisible(true);
game.buttons.push(buttonConversionUpgradeCamcorder);
game.conversionUpgradeButtons.push(buttonConversionUpgradeCamcorder);

var buttonConversionUpgradeComputer=new game.UpgradeButton(410,150,85,98,null, "computer",game.upgradeStats.computerUpgradeCosts,game.toolStats.computerStats, "conversion", 1, game.conversionTab, "Increases the conversion rate of computer by 1.5");
buttonConversionUpgradeComputer.setVisible(true);
game.buttons.push(buttonConversionUpgradeComputer);
game.conversionUpgradeButtons.push(buttonConversionUpgradeComputer);

var buttonConversionUpgradeLaptop=new game.UpgradeButton(494,150,85,98,null, "laptop",game.upgradeStats.laptopUpgradeCosts,game.toolStats.laptopStats, "conversion", 1, game.conversionTab, "Increases the conversion rate of laptop by 1.5");
buttonConversionUpgradeLaptop.setVisible(true);
game.buttons.push(buttonConversionUpgradeLaptop);
game.conversionUpgradeButtons.push(buttonConversionUpgradeLaptop);

for(var x=0;x<game.conversionUpgradeButtons.length;x++) {
    game.conversionObjects.push(game.conversionUpgradeButtons[x]);
}

//Create the objects that will go in the capture tab
game.captureHeader=new game.Background(0,0,584,126,null,"img/headers/capture.png");
game.captureHeader.setVisible(false);
game.backgrounds.push(game.captureHeader);

game.captureObjects=[];
game.captureObjects.push(game.captureHeader);

game.captureTab=new game.Tab(840,137,113,108,null,"img/tab_buttons/capture_button.png",game.captureObjects);
game.captureTab.setVisible(true);
game.tabs.push(game.captureTab);

//These will be all the capture buttons
var buttonCaptureNet=new game.ToolButton(0,267,580,98,null,"net","",game.toolStats.netStats, "capture", game.captureTab,"Bag them and tag them (and decapitate them)");
buttonCaptureNet.setVisible(true);
game.buttons.push(buttonCaptureNet);
game.captureToolButtons.push(buttonCaptureNet);

var buttonCaptureLasso=new game.ToolButton(0,384,580,98,null,"lasso","",game.toolStats.lassoStats,"capture",game.captureTab,"Yeehaw!");
buttonCaptureLasso.setVisible(true);
game.buttons.push(buttonCaptureLasso);
game.captureToolButtons.push(buttonCaptureLasso);

var buttonCaptureTrapdoor=new game.ToolButton(0,500,580,98,null,"trapdoor","",game.toolStats.trapdoorStats,"capture",game.captureTab,"Also can be used for flowerpots, and that weird stand thing in front of bars.");
buttonCaptureTrapdoor.setVisible(true);
game.buttons.push(buttonCaptureTrapdoor);
game.captureToolButtons.push(buttonCaptureTrapdoor);

var buttonCaptureVan=new game.ToolButton(0,617,580,98,null,"van","",game.toolStats.vanStats,"capture",game.captureTab,"No, we're not the FBI. Yes, we're still listening.");
buttonCaptureVan.setVisible(true);
game.buttons.push(buttonCaptureVan);
game.captureToolButtons.push(buttonCaptureVan);

var buttonCaptureInvasion=new game.ToolButton(0,734,580,98,null,"invasion","",game.toolStats.invasionStats,"capture",game.captureTab,"Walls are simply a compact way of storing future prisoners.");
buttonCaptureInvasion.setVisible(true);
game.buttons.push(buttonCaptureInvasion);
game.captureToolButtons.push(buttonCaptureInvasion);

var buttonCapturePhaser=new game.ToolButton(0,849,580,98,null,"phaser","",game.toolStats.phaserStats,"capture",game.captureTab,"Tried to use these as execution weapons, but someone keeps locking them to stun.");
buttonCapturePhaser.setVisible(true);
game.buttons.push(buttonCapturePhaser);
game.captureToolButtons.push(buttonCapturePhaser);

var buttonCaptureCloning=new game.ToolButton(0,964,580,98,null,"cloning","",game.toolStats.cloningStats,"capture",game.captureTab,"Genetically engineered for larger heads and thinner necks.");
buttonCaptureCloning.setVisible(true);
game.buttons.push(buttonCaptureCloning);
game.captureToolButtons.push(buttonCaptureCloning);

for(var x=0;x<game.captureToolButtons.length;x++) {
    game.captureObjects.push(game.captureToolButtons[x]);
}


game.capturePanels=[];
//These will be all the capture panels
var panelCaptureNet=new game.Background(647,267,647,100,null,"img/capture_panels/panel_capture_net.png");
panelCaptureNet.setVisible(true);
game.backgrounds.push(panelCaptureNet);
game.capturePanels.push(panelCaptureNet);

var panelCaptureLasso=new game.Background(647,384,647,100,null,"img/capture_panels/panel_capture_lasso.png");
panelCaptureLasso.setVisible(true);
game.backgrounds.push(panelCaptureLasso);
game.capturePanels.push(panelCaptureLasso);

var panelCaptureTrapdoor=new game.Background(647,500,647,100,null,"img/capture_panels/panel_capture_trapdoor.png");
panelCaptureTrapdoor.setVisible(true);
game.backgrounds.push(panelCaptureTrapdoor);
game.capturePanels.push(panelCaptureTrapdoor);

var panelCaptureVan=new game.Background(647,617,647,100,null,"img/capture_panels/panel_capture_van.png");
panelCaptureVan.setVisible(true);
game.backgrounds.push(panelCaptureVan);
game.capturePanels.push(panelCaptureVan);

var panelCaptureInvasion=new game.Background(647,734,647,100,null,"img/capture_panels/panel_capture_invasion.png");
panelCaptureInvasion.setVisible(true);
game.backgrounds.push(panelCaptureInvasion);
game.capturePanels.push(panelCaptureInvasion);

var panelCapturePhaser=new game.Background(647,849,647,100,null,"img/capture_panels/panel_capture_phaser.png");
panelCapturePhaser.setVisible(true);
game.backgrounds.push(panelCapturePhaser);
game.capturePanels.push(panelCapturePhaser);

var panelCaptureCloning=new game.Background(647,964,647,100,null,"img/capture_panels/panel_capture_cloning.png");
panelCaptureCloning.setVisible(true);
game.backgrounds.push(panelCaptureCloning);
game.capturePanels.push(panelCaptureCloning);

for(var x=0;x<game.capturePanels.length;x++) {
    game.captureObjects.push(game.capturePanels[x]);
}

//These are all the capture upgrade buttons
var buttonCaptureUpgradeNet=new game.UpgradeButton(-1,150,85,98,null, "net",game.upgradeStats.netUpgradeCosts,game.toolStats.netStats, "capture", 1, game.captureTab, "Increases the capture rate of  net by 1.5");
buttonCaptureUpgradeNet.setVisible(true);
game.buttons.push(buttonCaptureUpgradeNet);
game.captureUpgradeButtons.push(buttonCaptureUpgradeNet);

var buttonCaptureUpgradeLasso=new game.UpgradeButton(82,150,85,98,null, "lasso",game.upgradeStats.lassoUpgradeCosts,game.toolStats.lassoStats, "capture", 1, game.captureTab, "Increases the capture rate of  lasso by 1.5");
buttonCaptureUpgradeLasso.setVisible(true);
game.buttons.push(buttonCaptureUpgradeLasso);
game.captureUpgradeButtons.push(buttonCaptureUpgradeLasso);

var buttonCaptureUpgradeTrapdoor=new game.UpgradeButton(165,150,85,98,null, "trapdoor",game.upgradeStats.trapdoorUpgradeCosts,game.toolStats.trapdoorStats, "capture", 1, game.captureTab, "Increases the capture rate of trapdoor by 1.5");
buttonCaptureUpgradeTrapdoor.setVisible(true);
game.buttons.push(buttonCaptureUpgradeTrapdoor);
game.captureUpgradeButtons.push(buttonCaptureUpgradeTrapdoor);

var buttonCaptureUpgradeVan=new game.UpgradeButton(247,150,85,98,null, "van",game.upgradeStats.vanUpgradeCosts,game.toolStats.vanStats, "capture", 1, game.captureTab, "Increases the capture rate of van by 1.5");
buttonCaptureUpgradeVan.setVisible(true);
game.buttons.push(buttonCaptureUpgradeVan);
game.captureUpgradeButtons.push(buttonCaptureUpgradeVan);

var buttonCaptureUpgradeInvasion=new game.UpgradeButton(329,150,85,98,null, "invasion",game.upgradeStats.invasionUpgradeCosts,game.toolStats.invasionStats, "capture", 1, game.captureTab, "Increases the capture rate of invasion by 1.5");
buttonCaptureUpgradeInvasion.setVisible(true);
game.buttons.push(buttonCaptureUpgradeInvasion);
game.captureUpgradeButtons.push(buttonCaptureUpgradeInvasion);

var buttonCaptureUpgradePhaser=new game.UpgradeButton(410,150,85,98,null, "phaser",game.upgradeStats.phaserUpgradeCosts,game.toolStats.phaserStats, "capture", 1, game.captureTab, "Increases the capture rate of phaser by 1.5");
buttonCaptureUpgradePhaser.setVisible(true);
game.buttons.push(buttonCaptureUpgradePhaser);
game.captureUpgradeButtons.push(buttonCaptureUpgradePhaser);

var buttonCaptureUpgradeCloning=new game.UpgradeButton(494,150,85,98,null, "cloning",game.upgradeStats.cloningUpgradeCosts,game.toolStats.cloningStats, "capture", 1, game.captureTab, "Increases the capture rate of cloning by 1.5");
buttonCaptureUpgradeCloning.setVisible(true);
game.buttons.push(buttonCaptureUpgradeCloning);
game.captureUpgradeButtons.push(buttonCaptureUpgradeCloning);

for(var x=0;x<game.captureUpgradeButtons.length;x++) {
    game.captureObjects.push(game.captureUpgradeButtons[x]);
}

//Create the objects that will go in the execution tab 
game.executionHeader=new game.Background(0,0,584,126,null,"img/headers/execution.png");
game.executionHeader.setVisible(true);
game.backgrounds.push(game.executionHeader);

game.executionObjects=[];
game.executionObjects.push(game.executionHeader);

game.executionTab=new game.Tab(999,137,113,108,null,"img/tab_buttons/execution_button.png",game.executionObjects);
game.executionTab.setVisible(true);
game.tabs.push(game.executionTab);

//These are all the execution upgrade buttons
var buttonExecutionUpgradeKnife=new game.UpgradeButton(-1,150,85,98,null, "knife",game.upgradeStats.knifeUpgradeCosts,game.toolStats.knifeStats, "execution", 1, game.executionTab, "Increases the execution rate of knife by 10");
buttonExecutionUpgradeKnife.setVisible(true);
game.buttons.push(buttonExecutionUpgradeKnife);
game.executionUpgradeButtons.push(buttonExecutionUpgradeKnife);

var buttonExecutionUpgradeCleaver=new game.UpgradeButton(82,150,85,98,null, "cleaver",game.upgradeStats.cleaverUpgradeCosts,game.toolStats.cleaverStats, "execution", 1, game.executionTab, "Increases the execution rate of cleaver by 10");
buttonExecutionUpgradeCleaver.setVisible(true);
game.buttons.push(buttonExecutionUpgradeCleaver);
game.executionUpgradeButtons.push(buttonExecutionUpgradeCleaver);

var buttonExecutionUpgradeAxe=new game.UpgradeButton(165,150,85,98,null, "axe",game.upgradeStats.axeUpgradeCosts,game.toolStats.axeStats, "execution", 1, game.executionTab, "Increases the execution rate of axe by 10");
buttonExecutionUpgradeAxe.setVisible(true);
game.buttons.push(buttonExecutionUpgradeAxe);
game.executionUpgradeButtons.push(buttonExecutionUpgradeAxe);

var buttonExecutionUpgradeBlade=new game.UpgradeButton(247,150,85,98,null, "blade",game.upgradeStats.bladeUpgradeCosts,game.toolStats.bladeStats, "execution", 1, game.executionTab, "Increases the execution rate of blade by 10");
buttonExecutionUpgradeBlade.setVisible(true);
game.buttons.push(buttonExecutionUpgradeBlade);
game.executionUpgradeButtons.push(buttonExecutionUpgradeBlade);

var buttonExecutionUpgradeGuillotine=new game.UpgradeButton(329,150,85,98,null, "guillotine",game.upgradeStats.guillotineUpgradeCosts,game.toolStats.guillotineStats, "execution", 1, game.executionTab, "Increases the execution rate of guillotine by 10");
buttonExecutionUpgradeGuillotine.setVisible(true);
game.buttons.push(buttonExecutionUpgradeGuillotine);
game.executionUpgradeButtons.push(buttonExecutionUpgradeGuillotine);

var buttonExecutionUpgradeSaw=new game.UpgradeButton(410,150,85,98,null, "saw",game.upgradeStats.sawUpgradeCosts,game.toolStats.sawStats, "execution", 1, game.executionTab, "Increases the execution rate of saw by 10");
buttonExecutionUpgradeSaw.setVisible(true);
game.buttons.push(buttonExecutionUpgradeSaw);
game.executionUpgradeButtons.push(buttonExecutionUpgradeSaw);

var buttonExecutionUpgradeLightsaber=new game.UpgradeButton(494,150,85,98,null, "lightsaber",game.upgradeStats.lightsaberUpgradeCosts,game.toolStats.lightsaberStats, "execution", 1, game.executionTab, "Increases the execution rate of lightsaber by 10");
buttonExecutionUpgradeLightsaber.setVisible(true);
game.buttons.push(buttonExecutionUpgradeLightsaber);
game.executionUpgradeButtons.push(buttonExecutionUpgradeLightsaber);

//These will be all the execution buttons
//knife, cleavr, ax, blade, gui, saw, light
var buttonExecutionKnife=new game.ToolButton(0,267,580,98,null,"knife","",game.toolStats.knifeStats, "execution", game.executionTab,"stab stab stabby stab");
buttonExecutionKnife.setVisible(true);
game.buttons.push(buttonExecutionKnife);
game.executionToolButtons.push(buttonExecutionKnife);

var buttonExecutionCleaver=new game.ToolButton(0,384,580,98,null,"cleaver","",game.toolStats.cleaverStats,"execution",game.executionTab,"I 'ardly knew her!");
buttonExecutionCleaver.setVisible(true);
game.buttons.push(buttonExecutionCleaver);
game.executionToolButtons.push(buttonExecutionCleaver);

var buttonExecutionAxe=new game.ToolButton(0,500,580,98,null,"axe","",game.toolStats.axeStats,"execution",game.executionTab,"The favorite weapon of past presidents and crazed writers");
buttonExecutionAxe.setVisible(true);
game.buttons.push(buttonExecutionAxe);
game.executionToolButtons.push(buttonExecutionAxe);

var buttonExecutionBlade=new game.ToolButton(0,617,580,98,null,"blade","",game.toolStats.bladeStats,"execution",game.executionTab,"Do NOT try to use this blade as a top");
buttonExecutionBlade.setVisible(true);
game.buttons.push(buttonExecutionBlade);
game.executionToolButtons.push(buttonExecutionBlade);

var buttonExecutionGuillotine=new game.ToolButton(0,734,580,98,null,"guillotine","",game.toolStats.guillotineStats,"execution",game.executionTab,"Literally made for the job");
buttonExecutionGuillotine.setVisible(true);
game.buttons.push(buttonExecutionGuillotine);
game.executionToolButtons.push(buttonExecutionGuillotine);

var buttonExecutionSaw=new game.ToolButton(0,849,580,98,null,"saw","",game.toolStats.sawStats,"execution",game.executionTab,"Zombie slaying classic");
buttonExecutionSaw.setVisible(true);
game.buttons.push(buttonExecutionSaw);
game.executionToolButtons.push(buttonExecutionSaw);

var buttonExecutionLightsaber=new game.ToolButton(0,964,580,98,null,"lightsaber","",game.toolStats.lightsaberStats,"execution",game.executionTab,"An elegant weapon for a less civilized age");
buttonExecutionLightsaber.setVisible(true);
game.buttons.push(buttonExecutionLightsaber);
game.executionToolButtons.push(buttonExecutionLightsaber);

game.executionPanels=[];

//These will be all the execution panels
var panelExecutionKnife=new game.Background(647,267,647,100,null,"img/execution_panels/panel_execution_knife.png");
panelExecutionKnife.setVisible(true);
game.buttons.push(panelExecutionKnife);
game.executionPanels.push(panelExecutionKnife);

var panelExecutionCleaver=new game.Background(647,384,647,100,null,"img/execution_panels/panel_execution_cleaver.png");
panelExecutionCleaver.setVisible(true);
game.buttons.push(panelExecutionCleaver);
game.executionPanels.push(panelExecutionCleaver);

var panelExecutionAxe=new game.Background(647,500,647,100,null,"img/execution_panels/panel_execution_axe.png");
panelExecutionAxe.setVisible(true);
game.buttons.push(panelExecutionAxe);
game.executionPanels.push(panelExecutionAxe);

var panelExecutionBlade=new game.Background(647,617,647,100,null,"img/execution_panels/panel_execution_blade.png");
panelExecutionBlade.setVisible(true);
game.buttons.push(panelExecutionBlade);
game.executionPanels.push(panelExecutionBlade);

var panelExecutionGuillotine=new game.Background(647,734,647,100,null,"img/execution_panels/panel_execution_guillotine.png");
panelExecutionGuillotine.setVisible(true);
game.buttons.push(panelExecutionGuillotine);
game.executionPanels.push(panelExecutionGuillotine);

var panelExecutionSaw=new game.Background(647,849,647,100,null,"img/execution_panels/panel_execution_saw.png");
panelExecutionSaw.setVisible(true);
game.buttons.push(panelExecutionSaw);
game.executionPanels.push(panelExecutionSaw);

var panelExecutionLightsaber=new game.Background(647,964,647,100,null,"img/execution_panels/panel_execution_lightsaber.png");
panelExecutionLightsaber.setVisible(true);
game.buttons.push(panelExecutionLightsaber);
game.executionPanels.push(panelExecutionLightsaber);

for(var x=0;x<game.executionPanels.length;x++) {
    game.executionObjects.push(game.executionPanels[x]);
}

for(var x=0;x<game.executionToolButtons.length;x++) {
    game.executionObjects.push(game.executionToolButtons[x]);
}
for(var x=0;x<game.executionUpgradeButtons.length;x++) {
    game.executionObjects.push(game.executionUpgradeButtons[x]);
}
//Create the objects that will go in the stat tab
game.statHeader=new game.Background(0,0,584,126,null,"img/headers/stat.png");
game.statHeader.setVisible(true);
game.backgrounds.push(game.statHeader);

game.statPPText=new game.Text(game.masterBackground,657,300,"Total Coin: ","bold 24pt lucida console ","white",6,"#5f3c0f");
game.statPPNum=new game.TextNumber(game.masterBackground,900,300,"","bold 24pt lucida console ","white",6,"#5f3c0f",game.playerStats,"totalPrayerPoints");

game.statCultistsText=new game.Text(game.masterBackground,657,420,"Max Followers: ","bold 24pt lucida console ","white",6,"#5f3c0f");
game.statCultistsNum=new game.TextNumber(game.masterBackground,960,420,"","bold 24pt lucida console ","white",6,"#5f3c0f", game.playerStats,"totalCultists");

game.statExecutedText=new game.Text(game.masterBackground,657,533,"Total Executed: ","bold 24pt lucida console ","white",6,"#5f3c0f");
game.statExecutedNum=new game.TextNumber(game.masterBackground,990,533,"","bold 24pt lucida console ","white",6,"#5f3c0f", game.playerStats,"totalExecuted");

game.statExecutionRateText=new game.Text(game.masterBackground,657,647,"Execution Rate: ","bold 24pt lucida console ","white",6,"#5f3c0f");
game.statExecutionRateNum=new game.TextNumber(game.masterBackground,990,647,"","bold 24pt lucida console ","white",6,"#5f3c0f", game.playerStats,"prodRateExec");

game.statFollowerRateText=new game.Text(game.masterBackground,657,765,"Conversion Rate: ","bold 24pt lucida console ","white",6,"#5f3c0f");
game.statFollowerRateNum=new game.TextNumber(game.masterBackground,995,765,"","bold 24pt lucida console ","white",6,"#5f3c0f", game.playerStats,"prodRateCult");

game.statPPRateText=new game.Text(game.masterBackground,657,880,"Prisoner Rate: ","bold 24pt lucida console ","white",6,"#5f3c0f");
game.statPPRateNum=new game.TextNumber(game.masterBackground,995,880,"","bold 24pt lucida console ","white",6,"#5f3c0f", game.playerStats,"prodRatePris");

game.statTimeText=new game.Text(game.masterBackground,657,995,"Time Played: ","bold 24pt lucida console ","white",6,"#5f3c0f");
game.statTimeNum=new game.TextNumber(game.masterBackground,995,995,"","bold 24pt lucida console ","white",6,"#5f3c0f", game.playerStats,"time");

game.saveButton=new game.ButtonSave(0,300,50,50,"img/description.png");
game.buttons.push(game.saveButton);

game.statObjects=[];
game.statObjects.push(game.saveButton);
game.statObjects.push(game.statHeader);
game.statObjects.push(game.statPPText);
game.statObjects.push(game.statPPNum);
game.statObjects.push(game.statCultistsText);
game.statObjects.push(game.statCultistsNum);
game.statObjects.push(game.statExecutedText);
game.statObjects.push(game.statExecutedNum);
game.statObjects.push(game.statExecutionRateText);
game.statObjects.push(game.statExecutionRateNum);
game.statObjects.push(game.statFollowerRateText);
game.statObjects.push(game.statFollowerRateNum);
game.statObjects.push(game.statPPRateText);
game.statObjects.push(game.statPPRateNum);
game.statObjects.push(game.statTimeText);
game.statObjects.push(game.statTimeNum);

game.statTab=new game.Tab(1150,137,113,108,null,"img/tab_buttons/stat_button.png",game.statObjects);
game.statTab.setVisible(true);
game.tabs.push(game.statTab);

game.conversionTab.setTabVisible(true);
game.captureTab.setTabVisible(false);
game.executionTab.setTabVisible(false);
game.statTab.setTabVisible(false);

game.angry1=new game.Achievement(800,1000,"img/achievements/angry1.png", "Angry1");
game.angry1.checkCondition=function(){
    if(game.playerStats.prisoners > 10001){
        return true;
    }
}
game.achievements.push(game.angry1);
game.angry2=new game.Achievement(800,1000,"img/achievements/angry2.png", "Angry2");
game.angry2.checkCondition=function(){
    if(game.playerStats.prisoners > 1000001){
        return true;
    }
}
game.achievements.push(game.angry2);
game.happy1=new game.Achievement(800,1000,"img/achievements/happy1.png", "Happy1");
game.happy1.checkCondition=function(){
    if(game.playerStats.cultists > 10001){
        return true;
    }
}
game.achievements.push(game.happy1);
game.happy2=new game.Achievement(800,1000,"img/achievements/happy2.png", "Happy2");
game.happy2.checkCondition=function(){
    if(game.playerStats.cultists > 1000001){
        return true;
    }
}
game.achievements.push(game.happy2);

//game.a3=new game.Achievement(800,1000,"img/achievements/axe1.png", "Axe1");
//game.a3.checkCondition=function(){
//    if(game.toolStats.axeStats.numTools> 1){
//        return true;
//    }
//}
//game.a4=new game.Achievement(800,1000,"img/achievements/axe2.png", "Axe2");
//game.a4.checkCondition=function(){
//    if(game.toolStats.axeStats.numTools > 100){
//        return true;
//    }
//}
//game.a5=new game.Achievement(800,1000,"img/achievements/axe3.png", "Axe3");
//game.a5.checkCondition=function(){
//    if(game.toolStats.axeStats.numTools > 1001){
//        return true;
//    }
//}
//game.a6=new game.Achievement(800,1000,"img/achievements/blade1.png", "Blade1");
//game.a6.checkCondition=function(){
//    if(game.toolStats.bladeStats.numTools > 1){
//        return true;
//    }
//}
//game.a7=new game.Achievement(800,1000,"img/achievements/blade2.png", "Blade2");
//game.a7.checkCondition=function(){
//    if(game.toolStats.bladeStats.numTools > 10){
//        return true;
//    }
//}
//game.a8=new game.Achievement(800,1000,"img/achievements/blade3.png", "Blade3");
//game.a8.checkCondition=function(){
//    if(game.toolStats.bladeStats.numTools > 100){
//        return true;
//    }
//}
//game.a9=new game.Achievement(800,1000,"img/achievements/cleaver1.png", "Cleaver1");
//game.a9.checkCondition=function(){
//    if(game.toolStats.cleaverStats.numTools > 1){
//        return true;
//    }
//}
//game.a10=new game.Achievement(800,1000,"img/achievements/cleaver2.png", "Cleaver2");
//game.a9.checkCondition=function(){
//    if(game.toolStats.cleaverStats.numTools > 10){
//        return true;
//    }
//}
//game.a11=new game.Achievement(800,1000,"img/achievements/cleaver3.png", "Cleaver3");
//game.a11.checkCondition=function(){
//    if(game.toolStats.cleaverStats.numTools > 100){
//        return true;
//    }
//}
//game.a12=new game.Achievement(800,1000,"img/achievements/clone1.png", "Clone1");
//game.a12.checkCondition=function(){
//    if(game.toolStats.cloningStats.numTools > 1){
//        return true;
//    }
//}
//
//
//game.achievements.push(game.a2);
//game.achievements.push(game.a3);
//game.achievements.push(game.a4);
//game.achievements.push(game.a5);
//game.achievements.push(game.a6);

game.aaxe_1=new game.Achievement(800,1000,"img/achievements/axe1.png", "Axe_1"); game.aaxe_1.checkCondition=function(){     if(game.toolStats.axeStats.numTools > 10){         return true;     } } 
game.achievements.push(game.aaxe_1); game.aaxe_2=new game.Achievement(800,1000,"img/achievements/axe2.png", "Axe_2"); game.aaxe_2.checkCondition=function(){     if(game.toolStats.axeStats.numTools > 100){         return true;     } } 
game.achievements.push(game.aaxe_2); game.aaxe_3=new game.Achievement(800,1000,"img/achievements/axe3.png", "Axe_3"); game.aaxe_3.checkCondition=function(){     if(game.toolStats.axeStats.numTools > 1000){         return true;     } } 
game.achievements.push(game.aaxe_3);
game.ablade_1=new game.Achievement(800,1000,"img/achievements/blade1.png", "Blade_1"); game.ablade_1.checkCondition=function(){     if(game.toolStats.bladeStats.numTools > 10){         return true;     } }
game.achievements.push(game.ablade_1); game.ablade_2=new game.Achievement(800,1000,"img/achievements/blade2.png", "Blade_2"); game.ablade_2.checkCondition=function(){     if(game.toolStats.bladeStats.numTools > 100){         return true;     } }
game.achievements.push(game.ablade_2); game.ablade_3=new game.Achievement(800,1000,"img/achievements/blade3.png", "Blade_3"); game.ablade_3.checkCondition=function(){     if(game.toolStats.bladeStats.numTools > 1000){         return true;     } }
game.achievements.push(game.ablade_3);
game.abook_1=new game.Achievement(800,1000,"img/achievements/book1.png", "Book_1");
game.abook_1.checkCondition=function(){     if(game.toolStats.bookStats.numTools > 10){         return true;     } 
                                      }
game.achievements.push(game.abook_1); game.abook_2=new game.Achievement(800,1000,"img/achievements/book2.png", "Book_2"); game.abook_2.checkCondition=function(){     if(game.toolStats.bookStats.numTools > 100){         return true;     } }
game.achievements.push(game.abook_2); game.abook_3=new game.Achievement(800,1000,"img/achievements/book3.png", "Book_3"); game.abook_3.checkCondition=function(){     if(game.toolStats.bookStats.numTools > 1000){         return true;     } }
game.achievements.push(game.abook_3);
game.acamcorder_1=new game.Achievement(800,1000,"img/achievements/camcorder1.png", "Camcorder_1"); game.acamcorder_1.checkCondition=function(){     if(game.toolStats.camcorderStats.numTools > 10){         return true;     } }
game.achievements.push(game.acamcorder_1); game.acamcorder_2=new game.Achievement(800,1000,"img/achievements/camcorder2.png", "Camcorder_2"); game.acamcorder_2.checkCondition=function(){     if(game.toolStats.camcorderStats.numTools > 100){         return true;     } }
game.achievements.push(game.acamcorder_2); game.acamcorder_3=new game.Achievement(800,1000,"img/achievements/camcorder3.png", "Camcorder_3"); game.acamcorder_3.checkCondition=function(){     if(game.toolStats.camcorderStats.numTools > 1000){         return true;     } }
game.achievements.push(game.acamcorder_3);
game.acleaver_1=new game.Achievement(800,1000,"img/achievements/cleaver1.png", "Cleaver_1"); game.acleaver_1.checkCondition=function(){     if(game.toolStats.cleaverStats.numTools > 10){         return true;     } }
game.achievements.push(game.acleaver_1); game.acleaver_2=new game.Achievement(800,1000,"img/achievements/cleaver2.png", "Cleaver_2"); game.acleaver_2.checkCondition=function(){     if(game.toolStats.cleaverStats.numTools > 100){         return true;     } }
game.achievements.push(game.acleaver_2); game.acleaver_3=new game.Achievement(800,1000,"img/achievements/cleaver3.png", "Cleaver_3"); game.acleaver_3.checkCondition=function(){     if(game.toolStats.cleaverStats.numTools > 1000){         return true;     } }
game.achievements.push(game.acleaver_3);
game.aclone_1=new game.Achievement(800,1000,"img/achievements/clone1.png", "Clone_1"); game.aclone_1.checkCondition=function(){     if(game.toolStats.cloningStats.numTools > 10){         return true;     } }
game.achievements.push(game.aclone_1); game.aclone_2=new game.Achievement(800,1000,"img/achievements/clone2.png", "Clone_2"); game.aclone_2.checkCondition=function(){     if(game.toolStats.cloningStats.numTools > 100){         return true;     } }
game.achievements.push(game.aclone_2); game.aclone_3=new game.Achievement(800,1000,"img/achievements/clone3.png", "Clone_3"); game.aclone_3.checkCondition=function(){     if(game.toolStats.cloningStats.numTools > 1000){         return true;     } }

game.achievements.push(game.aclone_3);
game.acomputer_1=new game.Achievement(800,1000,"img/achievements/computer1.png", "Computer_1"); game.acomputer_1.checkCondition=function(){     if(game.toolStats.computerStats.numTools > 10){         return true;     } }
game.achievements.push(game.acomputer_1); game.acomputer_2=new game.Achievement(800,1000,"img/achievements/computer2.png", "Computer_2"); game.acomputer_2.checkCondition=function(){     if(game.toolStats.computerStats.numTools > 100){         return true;     } }
game.achievements.push(game.acomputer_2); game.acomputer_3=new game.Achievement(800,1000,"img/achievements/computer3.png", "Computer_3"); game.acomputer_3.checkCondition=function(){     if(game.toolStats.computerStats.numTools > 1000){         return true;     } }
game.achievements.push(game.acomputer_3);
game.aguillotine_1=new game.Achievement(800,1000,"img/achievements/guillotine1.png", "Guillotine_1"); game.aguillotine_1.checkCondition=function(){     if(game.toolStats.guillotineStats.numTools > 10){         return true;     } }

game.achievements.push(game.aguillotine_1); game.aguillotine_2=new game.Achievement(800,1000,"img/achievements/guillotine2.png", "Guillotine_2"); game.aguillotine_2.checkCondition=function(){     if(game.toolStats.guillotineStats.numTools > 100){         return true;     } }

game.achievements.push(game.aguillotine_2); game.aguillotine_3=new game.Achievement(800,1000,"img/achievements/guillotine3.png", "Guillotine_3"); game.aguillotine_3.checkCondition=function(){     if(game.toolStats.guillotineStats.numTools > 1000){         return true;     } }

game.achievements.push(game.aguillotine_3);
game.ainvasion_1=new game.Achievement(800,1000,"img/achievements/invasion1.png", "Invasion_1"); game.ainvasion_1.checkCondition=function(){     if(game.toolStats.invasionStats.numTools > 10){         return true;     } }
game.achievements.push(game.ainvasion_1); game.ainvasion_2=new game.Achievement(800,1000,"img/achievements/invasion2.png", "Invasion_2"); game.ainvasion_2.checkCondition=function(){     if(game.toolStats.invasionStats.numTools > 100){         return true;     } }
game.achievements.push(game.ainvasion_2); game.ainvasion_3=new game.Achievement(800,1000,"img/achievements/invasion3.png", "Invasion_3"); game.ainvasion_3.checkCondition=function(){     if(game.toolStats.invasionStats.numTools > 1000){         return true;     } }
game.achievements.push(game.ainvasion_3);
game.aknife_1=new game.Achievement(800,1000,"img/achievements/knife1.png", "Knife_1"); game.aknife_1.checkCondition=function(){     if(game.toolStats.knifeStats.numTools > 10){         return true;     } }
game.achievements.push(game.aknife_1); game.aknife_2=new game.Achievement(800,1000,"img/achievements/knife2.png", "Knife_2"); game.aknife_2.checkCondition=function(){     if(game.toolStats.knifeStats.numTools > 100){         return true;     } }
game.achievements.push(game.aknife_2); game.aknife_3=new game.Achievement(800,1000,"img/achievements/knife3.png", "Knife_3"); game.aknife_3.checkCondition=function(){     if(game.toolStats.knifeStats.numTools > 1000){         return true;     } }
game.achievements.push(game.aknife_3);
game.alaptop_1=new game.Achievement(800,1000,"img/achievements/laptop1.png", "Laptop_1"); game.alaptop_1.checkCondition=function(){     if(game.toolStats.laptopStats.numTools > 10){         return true;     } }
game.achievements.push(game.alaptop_1); game.alaptop_2=new game.Achievement(800,1000,"img/achievements/laptop2.png", "Laptop_2"); game.alaptop_2.checkCondition=function(){     if(game.toolStats.laptopStats.numTools > 100){         return true;     } }
game.achievements.push(game.alaptop_2); game.alaptop_3=new game.Achievement(800,1000,"img/achievements/laptop3.png", "Laptop_3"); game.alaptop_3.checkCondition=function(){     if(game.toolStats.laptopStats.numTools > 1000){         return true;     } }
game.achievements.push(game.alaptop_3);
game.alasso_1=new game.Achievement(800,1000,"img/achievements/lasso1.png", "Lasso_1"); game.alasso_1.checkCondition=function(){     if(game.toolStats.lassoStats.numTools > 10){         return true;     } }
game.achievements.push(game.alasso_1); game.alasso_2=new game.Achievement(800,1000,"img/achievements/lasso2.png", "Lasso_2"); game.alasso_2.checkCondition=function(){     if(game.toolStats.lassoStats.numTools > 100){         return true;     } }
game.achievements.push(game.alasso_2); game.alasso_3=new game.Achievement(800,1000,"img/achievements/lasso3.png", "Lasso_3"); game.alasso_3.checkCondition=function(){     if(game.toolStats.lassoStats.numTools > 1000){         return true;     } }
game.achievements.push(game.alasso_3);
game.alightsaber_1=new game.Achievement(800,1000,"img/achievements/lightsaber1.png", "Lightsaber_1"); game.alightsaber_1.checkCondition=function(){     if(game.toolStats.lightsaberStats.numTools > 10){         return true;     } }
game.achievements.push(game.alightsaber_1); game.alightsaber_2=new game.Achievement(800,1000,"img/achievements/lightsaber2.png", "Lightsaber_2"); game.alightsaber_2.checkCondition=function(){     if(game.toolStats.lightsaberStats.numTools > 100){         return true;     } }
game.achievements.push(game.alightsaber_2); game.alightsaber_3=new game.Achievement(800,1000,"img/achievements/lightsaber3.png", "Lightsaber_3"); game.alightsaber_3.checkCondition=function(){     if(game.toolStats.lightsaberStats.numTools > 1000){         return true;     } }
game.achievements.push(game.alightsaber_3);
game.anet_1=new game.Achievement(800,1000,"img/achievements/net1.png", "Net_1"); game.anet_1.checkCondition=function(){     if(game.toolStats.netStats.numTools > 10){         return true;     } } 
game.achievements.push(game.anet_1); game.anet_2=new game.Achievement(800,1000,"img/achievements/net2.png", "Net_2"); game.anet_2.checkCondition=function(){     if(game.toolStats.netStats.numTools > 100){         return true;     } } 
game.achievements.push(game.anet_2); game.anet_3=new game.Achievement(800,1000,"img/achievements/net3.png", "Net_3"); game.anet_3.checkCondition=function(){     if(game.toolStats.netStats.numTools > 1000){         return true;     } } 
game.achievements.push(game.anet_3);
game.aphaser_1=new game.Achievement(800,1000,"img/achievements/phaser1.png", "Phaser_1"); game.aphaser_1.checkCondition=function(){     if(game.toolStats.phaserStats.numTools > 10){         return true;     } }
game.achievements.push(game.aphaser_1); game.aphaser_2=new game.Achievement(800,1000,"img/achievements/phaser2.png", "Phaser_2"); game.aphaser_2.checkCondition=function(){     if(game.toolStats.phaserStats.numTools > 100){         return true;     } }
game.achievements.push(game.aphaser_2); game.aphaser_3=new game.Achievement(800,1000,"img/achievements/phaser3.png", "Phaser_3"); game.aphaser_3.checkCondition=function(){     if(game.toolStats.phaserStats.numTools > 1000){         return true;     } }
game.achievements.push(game.aphaser_3);
game.apodium_1=new game.Achievement(800,1000,"img/achievements/podium1.png", "Podium_1"); game.apodium_1.checkCondition=function(){     if(game.toolStats.podiumStats.numTools > 10){         return true;     } }
game.achievements.push(game.apodium_1); game.apodium_2=new game.Achievement(800,1000,"img/achievements/podium2.png", "Podium_2"); game.apodium_2.checkCondition=function(){     if(game.toolStats.podiumStats.numTools > 100){         return true;     } }
game.achievements.push(game.apodium_2); game.apodium_3=new game.Achievement(800,1000,"img/achievements/podium3.png", "Podium_3"); game.apodium_3.checkCondition=function(){     if(game.toolStats.podiumStats.numTools > 1000){         return true;     } }
game.achievements.push(game.apodium_3);
game.asaw_1=new game.Achievement(800,1000,"img/achievements/saw1.png", "Saw_1"); game.asaw_1.checkCondition=function(){     if(game.toolStats.sawStats.numTools > 10){         return true;     } } 
game.achievements.push(game.asaw_1); game.asaw_2=new game.Achievement(800,1000,"img/achievements/saw2.png", "Saw_2"); game.asaw_2.checkCondition=function(){     if(game.toolStats.sawStats.numTools > 100){         return true;     } } 
game.achievements.push(game.asaw_2); game.asaw_3=new game.Achievement(800,1000,"img/achievements/saw3.png", "Saw_3"); game.asaw_3.checkCondition=function(){     if(game.toolStats.sawStats.numTools > 1000){         return true;     } } 
game.achievements.push(game.asaw_3);
game.asoapbox_1=new game.Achievement(800,1000,"img/achievements/soapbox1.png", "Soapbox_1"); game.asoapbox_1.checkCondition=function(){     if(game.toolStats.soapboxStats.numTools > 10){         return true;     } }
game.achievements.push(game.asoapbox_1); game.asoapbox_2=new game.Achievement(800,1000,"img/achievements/soapbox2.png", "Soapbox_2"); game.asoapbox_2.checkCondition=function(){     if(game.toolStats.soapboxStats.numTools > 100){         return true;     } }
game.achievements.push(game.asoapbox_2); game.asoapbox_3=new game.Achievement(800,1000,"img/achievements/soapbox3.png", "Soapbox_3"); game.asoapbox_3.checkCondition=function(){     if(game.toolStats.soapboxStats.numTools > 1000){         return true;     } }
game.achievements.push(game.asoapbox_3);
game.aspeaker_1=new game.Achievement(800,1000,"img/achievements/speaker1.png", "Speaker_1"); game.aspeaker_1.checkCondition=function(){     if(game.toolStats.speakerStats.numTools > 10){         return true;     } }
game.achievements.push(game.aspeaker_1); game.aspeaker_2=new game.Achievement(800,1000,"img/achievements/speaker2.png", "Speaker_2"); game.aspeaker_2.checkCondition=function(){     if(game.toolStats.speakerStats.numTools > 100){         return true;     } }
game.achievements.push(game.aspeaker_2); game.aspeaker_3=new game.Achievement(800,1000,"img/achievements/speaker3.png", "Speaker_3"); game.aspeaker_3.checkCondition=function(){     if(game.toolStats.speakerStats.numTools > 1000){         return true;     } }
game.achievements.push(game.aspeaker_3);
game.atrapdoor_1=new game.Achievement(800,1000,"img/achievements/trapdoor1.png", "Trapdoor_1"); game.atrapdoor_1.checkCondition=function(){     if(game.toolStats.trapdoorStats.numTools > 10){         return true;     } }
game.achievements.push(game.atrapdoor_1); game.atrapdoor_2=new game.Achievement(800,1000,"img/achievements/trapdoor2.png", "Trapdoor_2"); game.atrapdoor_2.checkCondition=function(){     if(game.toolStats.trapdoorStats.numTools > 100){         return true;     } }
game.achievements.push(game.atrapdoor_2); game.atrapdoor_3=new game.Achievement(800,1000,"img/achievements/trapdoor3.png", "Trapdoor_3"); game.atrapdoor_3.checkCondition=function(){     if(game.toolStats.trapdoorStats.numTools > 1000){         return true;     } }
game.achievements.push(game.atrapdoor_3);
game.avan_1=new game.Achievement(800,1000,"img/achievements/van1.png", "Van_1"); game.avan_1.checkCondition=function(){     if(game.toolStats.vanStats.numTools > 10){         return true;     } }
game.achievements.push(game.avan_1); game.avan_2=new game.Achievement(800,1000,"img/achievements/van2.png", "Van_2"); game.avan_2.checkCondition=function(){     if(game.toolStats.vanStats.numTools > 100){         return true;     } }
game.achievements.push(game.avan_2); game.avan_3=new game.Achievement(800,1000,"img/achievements/van3.png", "Van_3"); game.avan_3.checkCondition=function(){     if(game.toolStats.vanStats.numTools > 1000){         return true;     } }
game.achievements.push(game.avan_3);



game.titleHeader=new game.Background(650,0,644,141,null,"img/logo.png");
game.titleHeader.setVisible(true);
game.backgrounds.push(game.titleHeader);

// ####################################################################################################
game.canvas = document.getElementById('game');
game.context = game.canvas.getContext('2d');

game.canvas.width=window.innerWidth;
game.canvas.height=window.innerHeight;
game.context.scale(game.widthScale,game.heightScale);

game.context.mouse = {
    x: 0,
    y: 0,
    clicked: false,
    down: false
}

game.canvas.addEventListener("mousemove", function (e) {
    game.context.mouse.x = e.offsetX/game.widthScale;
    game.context.mouse.y = e.offsetY / game.heightScale;
    //game.context.mouse.clicked = (e.which == 1 && !game.context.mouse.down);
    //game.context.mouse.down = (e.which == 1);
});

game.canvas.addEventListener("mousedown", function(e) {
    game.context.mouse.clicked = !game.context.mouse.down;
    game.context.mouse.down = true;
});

game.canvas.addEventListener("mouseup", function(e) {
    game.context.mouse.down = false;
    game.context.mouse.clicked = false;
});

// wait one second before starting animation
setTimeout(function() {
    game.startTime = (new Date()).getTime();

    //This function is the main tick for the game
    game.update();
}, 1000);