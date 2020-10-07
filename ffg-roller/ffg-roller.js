/**
 * @author Petep
 * @version 0.3
 */

/**
 * A Simple FFG RPG Rolling Module 
 * 
 */

class FfgRoller extends Application {
    constructor(app) {
        super(app);

        this.pool = {
            abil: 0, //green d8 +
            prof: 0, //yellow d12 +
            diff: 0, //purple d8 -
            chal: 0, //red d12 -
            boost: 0, //blue d6 +
            setback: 0, //black d6 -
            force: 0, //white d12 +-
            upgradeP: 0, //abil become prof, add abil if none
            downgradeP: 0, //prof become abil, do nothing if none
            upgradeN: 0, //diff become chall, add diff if none
            downgradeN: 0, //chal become diff, do nothing if none
        }

        this.hookRollerWindow();

    }
    /**
     * Define default options for the  application
     */
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "public/modules/ffg-roller/templates/roller-window.html";
        options.width = 150;
        options.height = "auto";
        return options;
    }
    //Open Roll window button
    hookRollerWindow(){
        Hooks.on('renderSettings', (app, html, data) => {
            const rollWindowButton = $(`<button class="roll-window-btn" style="max-width: 100% ;"><i class="fas fa-dice-d20"></i> FFG Roller</button>`);
            html.find('.game-system').append(rollWindowButton);

            rollWindowButton.click(ev => {
                ev.preventDefault();
                this.render(true);
            });
        });
    }
    //
    activateListeners(html) {
        html.find('input[name=abil]').on('change', ev => {
            this.pool.abil = ev.target.value;
        });
        html.find('input[name=prof]').on('change', ev => {
            this.pool.prof = ev.target.value;
        });
        html.find('input[name=boost]').on('change', ev => {
            this.pool.boost = ev.target.value;
        });
        html.find('input[name=diff]').on('change', ev => {
            this.pool.diff = ev.target.value;
        });
        html.find('input[name=chal]').on('change', ev => {
            this.pool.chal = ev.target.value;
        });
        html.find('input[name=setback]').on('change', ev => {
            this.pool.setback = ev.target.value;
        });
        html.find('input[name=force]').on('change', ev => {
            this.pool.force = ev.target.value;
        });
        html.find('input[name=upgradeP]').on('change', ev => {
            this.pool.upgradeP = ev.target.value;
        });
        html.find('input[name=downgradeP]').on('change', ev => {
            this.pool.downgradeP = ev.target.value;
        });
        html.find('input[name=upgradeN]').on('change', ev => {
            this.pool.upgradeN = ev.target.value;
        });
        html.find('input[name=downgradeN]').on('change', ev => {
            this.pool.downgradeN = ev.target.value;
        });
        html.find('button[name=roll]').click(ev => {
            //this.ffgRoll(this.pool);
            this.upDownPool(this.pool);
        });

    }
    //apply upgrades to the pool
    upDownPool (pool) {
        let modPool = JSON.parse(JSON.stringify(pool)); //convert to string than back to break refs
        if(modPool.upgradeP > 0) {
            for(let i = modPool.upgradeP; i > 0; i--) {
                if(modPool.abil > 0) {
                    modPool.abil --;
                    modPool.prof ++;
                } else {
                    modPool.abil ++;
                }
            }
        }
        if(modPool.upgradeN > 0) {
            for(let i = modPool.upgradeN; i > 0; i--) {
                if(modPool.diff > 0) {
                    modPool.diff --;
                    modPool.chal ++;
                } else {
                    modPool.diff ++;
                }
            }
        }
        //downgrade Pool
        if(modPool.downgradeP > 0) {
            for(let i = modPool.downgradeP; i > 0; i--) {
                if(modPool.prof > 0) {
                    modPool.prof --;
                    modPool.abil ++;
                } else {
                    break;
                }
            }
        }
        if(modPool.downgradeN > 0) {
            for(let i = modPool.downgradeN; i > 0; i--) {
                if(modPool.chal > 0) {
                    modPool.chal --;
                    modPool.diff ++;
                } else {
                    break;
                }
            }
        }
        console.log('modPool');
        console.log(modPool);
        this.ffgRoll(modPool);
    }
    //rolling function
    ffgRoll(modPool) {
        //init symbol vars
        var tri = 0, suc = 0, adv = 0, fail = 0, threat = 0, dis = 0, black = 0, white = 0;
        var faces = {
            abil: [0, 0, 0, 0, 0, 0], //0-nil, 1-s, 2-ss, 3-a, 4-aa, 5-combo
            prof: [0, 0, 0, 0, 0, 0, 0], //0-nil, 1-s, 2-ss, 3-a, 4-aa, 5-combo, 6-tri
            diff: [0, 0, 0, 0, 0, 0], //0-nil, 1-f, 2-ff, 3-t, 4-tt, 5-combo
            chal: [0, 0, 0, 0, 0, 0, 0], //0-nil, 1-f, 2-ff, 3-t, 4-tt, 5-combo 6-d
            boost: [0, 0, 0, 0, 0], //0-nil, 1-s, 2-a, 3-aa, 4-combo
            setback: [0, 0, 0], //0-nil, 1-f, 2-t
            force: [0, 0, 0, 0] //0-b, 1-bb, 2-w, 3-ww
        }
        //Interpreting the dice rolls for calculation while keeping track of faces
        //ability die
        if (modPool.abil > 0) {
            let abilDie = new Roll(modPool.abil + "d8");
            abilDie.roll();
            let result = abilDie.dice[0].rolls;
            for (let i = 0; i < result.length; i++) {
                switch (result[i].roll) {
                    case 1:
                        faces.abil[0] += 1;
                        break;
                    case 2:
                        suc += 1;
                        faces.abil[1] += 1;
                        break;
                    case 3:
                        suc += 1;
                        faces.abil[1] += 1;
                        break;
                    case 4:
                        suc += 2;
                        faces.abil[2] += 1;
                        break;
                    case 5:
                        adv += 1;
                        faces.abil[3] += 1;
                        break;
                    case 6:
                        adv += 1;
                        faces.abil[3] += 1;
                        break;
                    case 7:
                        suc += 1;
                        adv += 1;
                        faces.abil[5] += 1;
                        break;
                    case 8:
                        adv += 2;
                        faces.abil[4] += 1;
                        break;
                    default:
                        break;
                }
            }
        }
        //proficiency die
        if (modPool.prof > 0) {
            let profDie = new Roll(modPool.prof + "d12")
            profDie.roll();
            let result = profDie.dice[0].rolls;
            for (let i = 0; i < result.length; i++) {
                switch (result[i].roll) {
                    case 1:
                        faces.prof[0] += 1;
                        break;
                    case 2:
                        suc += 1;
                        faces.prof[1] += 1;
                        break;
                    case 3:
                        suc += 1;
                        faces.prof[1] += 1;
                        break;
                    case 4:
                        suc += 2;
                        faces.prof[2] += 1;
                        break;
                    case 5:
                        suc += 2;
                        faces.prof[2] += 1;
                        break;
                    case 6:
                        adv += 1;
                        faces.prof[3] += 1;
                        break;
                    case 7:
                        suc += 1;
                        adv += 1;
                        faces.prof[5] += 1;
                        break;
                    case 8:
                        suc += 1;
                        adv += 1;
                        faces.prof[5] += 1;
                        break;
                    case 9:
                        suc += 1;
                        adv += 1;
                        faces.prof[5] += 1;
                        break;
                    case 10:
                        adv += 2;
                        faces.prof[4] += 1;
                        break;
                    case 11:
                        adv += 2;
                        faces.prof[4] += 1;
                        break;
                    case 12:
                        suc += 1;
                        tri += 1;
                        faces.prof[6] += 1;
                        break;
                    default:
                        break;
                }
            }
        }
        //difficulty die
        if (modPool.diff > 0) {
            let diffDie = new Roll(modPool.diff + "d8")
            diffDie.roll();
            let result = diffDie.dice[0].rolls;
            for (let i = 0; i < result.length; i++) {
                switch (result[i].roll) {
                    case 1:
                        faces.diff[0] += 1;
                        break;
                    case 2:
                        fail -= 1;
                        faces.diff[1] += 1;
                        break;
                    case 3:
                        fail -= 2;
                        faces.diff[2] += 1;
                        break;
                    case 4:
                        threat -= 1;
                        faces.diff[3] += 1;
                        break;
                    case 5:
                        threat -= 1;
                        faces.diff[3] += 1;
                        break;
                    case 6:
                        threat -= 1;
                        faces.diff[3] += 1;
                        break;
                    case 7:
                        threat -= 2;
                        faces.diff[4] += 1;
                        break;
                    case 8:
                        threat -= 1;
                        fail -= 1;
                        faces.diff[5] += 1;
                        break;
                    default:
                        break;
                }
            }
        }
        //Challenge die
        if (modPool.chal > 0) {
            let chalDie = new Roll(modPool.chal + "d12");
            chalDie.roll();
            let result = chalDie.dice[0].rolls;
            for (let i = 0; i < result.length; i++) {
                switch (result[i].roll) {
                    case 1:
                        faces.chal[0] += 1;
                        break;
                    case 2:
                        fail -= 1;
                        faces.chal[1] += 1;
                        break;
                    case 3:
                        fail -= 1;
                        faces.chal[1] += 1;
                        break;
                    case 4:
                        fail -= 2;
                        faces.chal[2] += 1;
                        break;
                    case 5:
                        fail -= 2;
                        faces.chal[2] += 1;
                        break;
                    case 6:
                        threat -= 1;
                        faces.chal[3] += 1;
                        break;
                    case 7:
                        threat -= 1;
                        faces.chal[3] += 1;
                        break;
                    case 8:
                        threat -= 1;
                        fail -= 1;
                        faces.chal[5] += 1;
                        break;
                    case 9:
                        threat -= 1;
                        fail -= 1;
                        faces.chal[5] += 1;
                        break;
                    case 10:
                        threat -= 2;
                        faces.chal[4] += 1;
                        break;
                    case 11:
                        threat -= 2;
                        faces.chal[4] += 1;
                        break;
                    case 12:
                        fail -= 1;
                        dis -= 1;
                        faces.chal[6] += 1;
                        break;
                    default:
                        break;
                }
            }
        }
        //boost die
        if (modPool.boost > 0) {
            let boostDie = new Roll(modPool.boost + "d6")
            boostDie.roll();
            let result = boostDie.dice[0].rolls;
            for (let i = 0; i < result.length; i++) {
                switch (result[i].roll) {
                    case 1:
                        faces.boost[0] += 1;
                        break;
                    case 2:
                        faces.boost[0] += 1;
                        break;
                    case 3:
                        suc += 1;
                        faces.boost[1] += 1;
                        break;
                    case 4:
                        suc += 1;
                        adv += 1;
                        faces.boost[4] += 1;
                        break;
                    case 5:
                        adv += 2;
                        faces.boost[3] += 1;
                        break;
                    case 6:
                        adv += 1;
                        faces.boost[2] += 1;
                        break;
                    default:
                        break;
                }
            }
        }
        //setback die
        if (modPool.setback > 0) {
            let setbackDie = new Roll(modPool.setback + "d6")
            setbackDie.roll();
            let result = setbackDie.dice[0].rolls;
            for (let i = 0; i < result.length; i++) {
                switch (result[i].roll) {
                    case 1:
                        faces.setback[0] += 1;
                        break;
                    case 2:
                        faces.setback[0] += 1;
                        break;
                    case 3:
                        fail -= 1;
                        faces.setback[1] += 1;
                        break;
                    case 4:
                        fail -= 1;
                        faces.setback[1] += 1;
                        break;
                    case 5:
                        threat -= 1;
                        faces.setback[2] += 1;
                        break;
                    case 6:
                        threat -= 1;
                        faces.setback[2] += 1;
                        break;
                    default:
                        break;
                }
            }
        }
        //force die
        if (modPool.force > 0) {
            let forceDie = new Roll(modPool.force + "d12");
            forceDie.roll();
            let result = forceDie.dice[0].rolls;
            for (let i = 0; i < result.length; i++) {
                switch (result[i].roll) {
                    case 1:
                        black -= 1;
                        faces.force[0] += 1;
                        break;
                    case 2:
                        black -= 1;
                        faces.force[0] += 1;
                        break;
                    case 3:
                        black -= 1;
                        faces.force[0] += 1;
                        break;
                    case 4:
                        black -= 1;
                        faces.force[0] += 1;
                        break;
                    case 5:
                        black -= 1;
                        faces.force[0] += 1;
                        break;
                    case 6:
                        black -= 1;
                        faces.force[0] += 1;
                        break;
                    case 7:
                        black -= 2;
                        faces.force[1] += 1;
                        break;
                    case 8:
                        white += 1;
                        faces.force[2] += 1;
                        break;
                    case 9:
                        white += 1;
                        faces.force[2] += 1;
                        break;
                    case 10:
                        white += 2;
                        faces.force[3] += 1;
                        break;
                    case 11:
                        white += 2;
                        faces.force[3] += 1;
                        break;
                    case 12:
                        white += 2;
                        faces.force[3] += 1;
                        break;
                    default:
                        break;
                }
            }
        }
        //final calculation
        var finalCalc = [0, 0, 0, 0, 0, 0]; //[0]sucFail [1]advThreat [2]tri [3]dis [4] white [5] black
        finalCalc[0] = suc + fail;
        finalCalc[1] = adv + threat;
        finalCalc[2] = tri;
        finalCalc[3] = dis;
        finalCalc[4] = white;
        finalCalc[5] = black;
        this.rollDialog(finalCalc, faces);
        //console logs for debugging
        console.log(`Results:\nSuc:${suc}\nAdv:${adv}\nTri:${tri}\nFail:${fail}\nThreat:${threat}\nDis:${dis}\nBlack:${black}\nWhite:${white}`);
        console.log(`Upgrades/Downgrades:\nUpgrade Positive:${modPool.upgradeP}\nDowngrade Positive:${modPool.downgradeP}\nUpgrade Negative:${modPool.upgradeN}\nDowngrade Negative:${modPool.downgradeN}`);
        console.log(`Faces:\nAbil:${faces.abil}\nProf:${faces.prof}\nBoost:${faces.boost}\nDiff:${faces.diff}\nChal:${faces.chal}\nSetback:${faces.setback}\nForce:${faces.force}`);
        console.log(`Calculated: ${finalCalc}`);
    } //end ffgRoll
    //generate image tags for die faces for chat message
    chatResultFace(faces) {
        let output = "";
        let src = "";
        let path = "modules/ffg-roller/images/";
        let imgTag = '<img src="fPath" width="36" height="36"/>';
        //ability dice
        for (let i = 0; i < faces.abil.length; i++) {
            if (faces.abil[i] > 0) {
                switch (i) {
                    case 0:
                        src = path + "Ability_Blank.png";
                        break;
                    case 1:
                        src = path + "Ability_Success.png";
                        break;
                    case 2:
                        src = path + "Ability_Success_2.png";
                        break;
                    case 3:
                        src = path + "Ability_Advantage.png";
                        break;
                    case 4:
                        src = path + "Ability_Advantage_2.png";
                        break;
                    case 5:
                        src = path + "Ability_Combo.png";
                        break;
                    default:
                        break;
                }
                for (let j = faces.abil[i]; j > 0; j--) {
                    output += imgTag.replace('fPath', src);
                }
            }
        }
        //proficiency dice
        for (let i = 0; i < faces.prof.length; i++) {
            if (faces.prof[i] > 0) {
                switch (i) {
                    case 0:
                        src = path + "Proficiency_Blank.png";
                        break;
                    case 1:
                        src = path + "Proficiency_Success.png";
                        break;
                    case 2:
                        src = path + "Proficiency_Success_2.png";
                        break;
                    case 3:
                        src = path + "Proficiency_Advantage.png";
                        break;
                    case 4:
                        src = path + "Proficiency_Advantage_2.png";
                        break;
                    case 5:
                        src = path + "Proficiency_Combo.png";
                        break;
                    case 6:
                        src = path + "Proficiency_Triumph.png";
                        break;
                    default:
                        break;
                }
                for (let j = faces.prof[i]; j > 0; j--) {
                    output += imgTag.replace('fPath', src);
                }
            }
        }
        //Boost dice
        for (let i = 0; i < faces.boost.length; i++) {
            if (faces.boost[i] > 0) {
                switch (i) {
                    case 0:
                        src = path + "Boost_Blank.png";
                        break;
                    case 1:
                        src = path + "Boost_Success.png";
                        break;
                    case 2:
                        src = path + "Boost_Advantage.png";
                        break;
                    case 3:
                        src = path + "Boost_Advantage_2.png";
                        break;
                    case 4:
                        src = path + "Boost_Combo.png";
                        break;
                    default:
                        break;
                }
                for (let j = faces.boost[i]; j > 0; j--) {
                    output += imgTag.replace('fPath', src);
                }
            }
        }
        //difficulty dice
        for (let i = 0; i < faces.diff.length; i++) {
            if (faces.diff[i] > 0) {
                switch (i) {
                    case 0:
                        src = path + "Difficulty_Blank.png";
                        break;
                    case 1:
                        src = path + "Difficulty_Fail.png";
                        break;
                    case 2:
                        src = path + "Difficulty_Fail_2.png";
                        break;
                    case 3:
                        src = path + "Difficulty_Threat.png";
                        break;
                    case 4:
                        src = path + "Difficulty_Threat_2.png";
                        break;
                    case 5:
                        src = path + "Difficulty_Combo.png";
                        break;
                    default:
                        break;
                }
                for (let j = faces.diff[i]; j > 0; j--) {
                    output += imgTag.replace('fPath', src);
                }
            }
        }
        //Challenge dice
        for (let i = 0; i < faces.chal.length; i++) {
            if (faces.chal[i] > 0) {
                switch (i) {
                    case 0:
                        src = path + "Challenge_Blank.png";
                        break;
                    case 1:
                        src = path + "Challenge_Fail.png";
                        break;
                    case 2:
                        src = path + "Challenge_Fail_2.png";
                        break;
                    case 3:
                        src = path + "Challenge_Threat.png";
                        break;
                    case 4:
                        src = path + "Challenge_Threat_2.png";
                        break;
                    case 5:
                        src = path + "Challenge_Combo.png";
                        break;
                    case 6:
                        src = path + "Challenge_Dispair.png";
                        break;
                    default:
                        break;
                }
                for (let j = faces.chal[i]; j > 0; j--) {
                    output += imgTag.replace('fPath', src);
                }
            }
        }
        //Setback dice
        for (let i = 0; i < faces.setback.length; i++) {
            if (faces.setback[i] > 0) {
                switch (i) {
                    case 0:
                        src = path + "Setback_Blank.png";
                        break;
                    case 1:
                        src = path + "Setback_Fail.png";
                        break;
                    case 2:
                        src = path + "Setback_Threat.png";
                        break;
                    default:
                        break;
                }
                for (let j = faces.setback[i]; j > 0; j--) {
                    output += imgTag.replace('fPath', src);
                }
            }
        }
        //Force dice
        for (let i = 0; i < faces.force.length; i++) {
            if (faces.force[i] > 0) {
                switch (i) {
                    case 0:
                        src = path + "Force_1B.png";
                        break;
                    case 1:
                        src = path + "Force_2B.png";
                        break;
                    case 2:
                        src = path + "Force_1W.png";
                        break;
                    case 3:
                        src = path + "Force_2W.png";
                        break;
                    default:
                        break;
                }
                for (let j = faces.force[i]; j > 0; j--) {
                    output += imgTag.replace('fPath', src);
                }
            }
        }
        return output;
    } //end chatResultFace
    //generate the img tags to feed to the template for the calculated result to go to chat
    chatResultCalc(calcArray) {
        let output = "";
        let path = "modules/ffg-roller/images/";
        let src = "";
        for (let i = 0; i < calcArray.length; i++) {
            if (calcArray[i] > 0) { //good dice
                switch (i) {
                    case 0:
                        src = path + "Success.png";
                        break;
                    case 1:
                        src = path + "Advantage.png"
                        break;
                    case 2:
                        src = path + "Triumph.png"
                        break;
                    case 3:
                        src = path + "Dispair.png"//this should never come up this value is neg or 0
                        break;
                    case 4:
                        src = path + "White.png"
                        break;
                    case 5:
                        src = path + "Black.png" //this should never come up this value is neg or 0
                        break;
                    default:
                        break;
                }
                for (let j = calcArray[i]; j > 0; j--) {
                    let stringTemp = `<img src="${src}" width="36" height="36"/>`;
                    output += stringTemp;
                }
            } else if (calcArray[i] < 0) { //bad dice
                switch (i) {
                    case 0:
                        src = path + "Fail.png";
                        break;
                    case 1:
                        src = path + "Threat.png"
                        break;
                    case 2:
                        src = path + "Triumph.png"//this should never come up this value is pos or 0
                        break;
                    case 3:
                        src = path + "Dispair.png"
                        break;
                    case 4:
                        src = path + "White.png" //this should never come up this value is pos or 0
                        break;
                    case 5:
                        src = path + "Black.png"
                        break;
                    default:
                        break;
                }
                for (let j = calcArray[i]; j < 0; j++) {
                    let stringTemp = `<img src="${src}" width="36" height="36"/>`;
                    output += stringTemp;
                }
            }
        }
        return output;
    } //end chatResultCalc
    async rollDialog(finalCalc, faces) {
        //compose and render chat message
        event.preventDefault();
        const template = "public/modules/ffg-roller/templates/roll-dialog.html";
        const templateData = {
            imgUpper: this.chatResultFace(faces),
            imgLower: this.chatResultCalc(finalCalc)
        };
        const chatData = {
            user: game.user.id,
            type: CHAT_MESSAGE_TYPES.OTHER
        };
        chatData["content"] = await renderTemplate(template, templateData);
        return ChatMessage.create(chatData, { displaySheet: false });
    }
} //end FfgRoller
let ffgroller = new FfgRoller();