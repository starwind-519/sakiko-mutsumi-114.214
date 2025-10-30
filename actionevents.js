//加油写彩蛋啊
const actionEvents = {
  // 发呆 - 独立类
  doNothing: [
    // 累计 5 次触发（纯剧情）
    {
      condition: (count, state) => count === 5,
      text:
        "你又一次发呆时，<span class='mutsumi-text'>睦</span>走了过来。<br>" +
        "她没有立刻开口，只是看了你一会儿，神情有些犹豫。<br>" +
        "“祥……怎么了？”<br>" +
        "她的声音轻轻的，像怕惊扰你一样。那种温柔，让你一瞬间想躲开，又舍不得。",

      effect: () => {
        gameState.mutsumiMood = clamp(gameState.mutsumiMood - 1);
        gameState.love += 1;
        updateUI();
      },
      once: true
    },

    // 累计 10 次触发（带选项）
    {
      condition: (count, state) => count === 10,
      text:
        "<span class='mutsumi-text'>睦</span>终于忍不住。她伸手握住了你的手——动作不大，却很用力。<br>" +
        "“祥……你是不是，有什么话没跟我说？”<br>" +
        "她的语气听起来平静，可指尖微微发抖。",
      choices: [
        {
          text: "（安慰她）“没事，我只是有点累。”",
          feedback:
            "睦看着你，像是想确认什么，但最后只是轻轻点了下头。<br>" +
            "“……那就好。”<br>" +
            "她这么说，可那种不安，依然留在她的表情里。",
          effect: () => {
            gameState.mutsumiMood = clamp(gameState.mutsumiMood - 1);
            gameState.love += 1;
            updateUI();
          }
        },
        {
          text: "（坦白）“我只是……害怕失去你。”",
          feedback:
            "你说完这句话的时候，睦愣住了。她眨了眨眼，像是在忍泪。<br>" +
            "下一秒，她的手握得更紧了。<br>" +
            "“只要你还在这，我就不会消失的。”",
          effect: () => {
            gameState.love += 3;
            gameState.sakikoMood = clamp(gameState.sakikoMood - 2);
            updateUI();
          }
        },
        {
          text: "（转移话题）“别担心啦，快去休息吧。”",
          feedback:
            "睦沉默了几秒，指尖慢慢松开。<br>" +
            "她低声说：“嗯……那晚安。”<br>" +
            "那句晚安听起来很轻，可你知道——她有点失落。",
          effect: () => {
            gameState.mutsumiMood = clamp(gameState.mutsumiMood - 2);
            updateUI();
          }
        }
      ],
      once: true
    },

    {
      condition: (count, state) => count === 15,
      text:
        "在你发呆的时候，你好像隐隐约约听见什么声音。<br>" +
        "“——祥——祥——”<br>" +
        "“怎么又在发呆了？”<br>" +
        "“……怎么了，睦？”<br>" +
        "“你看，今晚的月色，很美哦。”<br>"+
        "你顺着睦的指尖从窗口看上去，发现今晚的天意外的清澈，星星在夜空中闪烁，明亮的圆月在夜空中高高挂起，显得此刻多么安宁。<br>" +
        "这个场景让你觉得——",
      choices: [
        {
          text: "“好美啊，感觉风也温柔了。”",
          feedback:
            "睦看着你，温柔的笑了。<br>" +
            "“祥喜欢就好。”<br>" +
            "她这么说，你从她的双眼里看见欣喜，也从中看见同样微笑着的自己。",
          effect: () => {
            gameState.mutsumiMood = clamp(gameState.mutsumiMood +5);
            gameState.sakikoMood = clamp(gameState.sakikoMood +5);
            gameState.love += 3;
            updateUI();
          }
        },
        {
          text: "“月亮出现了，得早点休息。”",
          feedback:
            "睦沉默了几秒，然后轻声笑了出来。<br>" +
            "她说：“是呢，祥得好好休息，这些天幸苦了，晚安。”<br>" +
            "“晚安。”你不懂睦为什么笑，但你依旧回应了她，并把睦一起拉去休息。",
          effect: () => {
            gameState.mutsumiMood = clamp(gameState.mutsumiMood +2);
            gameState.sakikoMood = clamp(gameState.sakikoMood +2);
            gameState.love += 1;
            updateUI();
          }
        }
      ],
      once: true
    }
  ],


// 2. 和睦互动 - 统一归为 interaction 类
    withMutsumi: [
    // ===== 8 次 =====
    {
        condition: (count, state) => count === 8,
        text:
        "你们已经习惯了并肩而坐的时光。<br>" +
        "<span class='mutsumi-text'>睦</span>轻轻靠在你肩上，你感觉呼吸与心跳都变得很近。<br>" +
        "过了很久，她才开口。<br>" +
        "“祥……你总是陪在我身边。谢谢。”<br>" +
        "她的声音有点沙哑，却带着笑意。那一刻，你突然意识到——原来安静的氛围也可以是这么的温柔。",
        effect: () => {
        gameState.sakikoMood = clamp(gameState.sakikoMood + 3);
        gameState.mutsumiMood = clamp(gameState.mutsumiMood + 3);
        gameState.love += 2;
        updateUI();
        },
        once: true
    },

    // ===== 15 次（有选项）=====
    {
        condition: (count, state) => count === 15,
        text:
        "屋里烛光轻晃。窗外的雨声是远忽近，只有彼此的呼吸在同一个节奏里。<br>" +
        "<span class='mutsumi-text'>睦</span>忽然开口，语气轻得像是在梦里。<br>" +
        "“祥……你有没有后悔过，和我留在这里？”<br>" +
        "她低着头，指尖摩挲着你的袖口，眼底闪过一瞬的慌乱。",
        choices: [
        {
            text: "“从来没有。”",
            feedback:
            "你几乎是立刻回答的。<br>" +
            "睦怔了一下，然后轻轻笑了。<br>" +
            "“那就好。”<br>" +
            "那抹笑意不大，却比烛光更亮，暖得让你心酸。",
            effect: () => {
            gameState.love += 4;
            gameState.mutsumiMood += 3;
            updateUI();
            }
        },
        {
            text: "“有时候……会想，如果不是这样就好了。”",
            feedback:
            "睦的手顿了顿。<br>" +
            "她没抬头，只是静静地听着，像在努力消化你的话。<br>" +
            "“……嗯，我明白。”<br>" +
            "她的声音低低的，带着一点歉意。那晚的烛光，好像也变得更暗了。",
            effect: () => {
            gameState.sakikoMood -= 2;
            gameState.mutsumiMood -= 3;
            updateUI();
            }
        }
        ],
        once: true
    },

    // ===== 20 次（有选项）=====
    {
    condition: (count, state) => count === 20,
    text:
        "破旧的窗被风掠的吱吱作响，烛光的影子在墙上摇晃。<br>" +
        "<span class='mutsumi-text'>睦</span>的目光停在你脸上，金色的眼里藏着一丝犹豫。<br>" +
        "她像是鼓起了很大的勇气，才轻轻问道：<br>" +
        "“祥……如果有一天我变成丧尸了，你会怎么办？”" ,
    choices: [
        {
        text: "“我会想办法救你。”",
        feedback:
            "那句话让睦怔住了。她的睫毛轻轻一抖，像是被你直白的回答给灼伤了。<br>" +
            "片刻后，她移开视线，嘴角却弯起一抹极浅的笑。<br>" +
            "“……真像你。”<br>" +
            "那笑里混着释然，也藏着一点快要消失的希望。",
        effect: () => {
            gameState.love += 5;
            gameState.mutsumiMood += 2;
            updateUI();
        }
        },
        {
        text: "“到时候……我会结束这一切。”",
        feedback:
            "空气一下子冷了。睦的手指在膝上轻轻颤动，指节发白。<br>" +
            "她低声应了一句：“……我明白。”<br>" +
            "然后什么也没再说，只是把头埋进膝间。<br>" +
            "那一夜，你听见她的呼吸变得很轻，几乎要和风声融在一起。",
        effect: () => {
            gameState.sakikoMood -= 3;
            gameState.mutsumiMood -= 5;
            updateUI();
        }
        }
    ],
    once: true
    },

    // ===== 25 次 =====
    {
    condition: (count, state) => count === 25,
    text:
        "不知道是第几个夜晚。你们坐在破旧的窗边，外头的世界一片漆黑。<br>" +
        "火光在两人之间闪烁，<span class='mutsumi-text'>睦</span>轻轻靠在你肩上。<br>" +
        "她忽然开口，声音低得几乎被风吞没。<br>" +
        "“真好，我们都还活着。”<br>" +
        "你感觉到她的体温有些凉，却还是下意识伸手，把她的手握得更紧。",
    effect: () => {
        gameState.love += 6;
        gameState.sakikoMood += 5;
        gameState.mutsumiMood += 5;
        updateUI();
    },
    once: true
    }
 ],

// 3. 治疗睦 - 统一归为 treat 类
treatMutsumi: [
  // ===== 5 次 =====
  {
    condition: (count, state) => count === 5,
    text:
      "你替<span class='mutsumi-text'>睦</span>清理伤口时，她皱着眉，却始终没出声。<br>" +
      "直到你准备收回手，她才轻轻说：<br>" +
      "“祥……我真的没事，你别担心。”<br>" +
      "话音很轻，可她的手指却悄悄抓住了你的衣角，不肯松开。",
    effect: () => {
      gameState.mutsumiMood += 2;
      gameState.sakikoMood += 1;
      gameState.love += 2;
      updateUI();
    },
    once: true
  },

  // ===== 8 次（带选项）=====
  {
    condition: (count, state) => count === 8,
    text:
      "血腥味弥漫在空气中。昏暗的灯光下，<span class='mutsumi-text'>睦</span>盯着你微微发抖的手。<br>" +
      "过了一会儿，她低声问：<br>" +
      "“祥……是不是，其实很害怕？”<br>" +
      "她的声音有些哑，像是怕得到某个答案。",
    choices: [
      {
        text: "“怕一不小心睦就离开了。”",
        feedback:
          "那一瞬间，<span class='mutsumi-text'>睦</span>愣住了。<br>" +
          "她的眼眶微微发红，随后伸手覆在你的手背上。<br>" +
          "“……我不会丢下祥的。绝对不会。”<br>" +
          "她的声音很稳，鉴定的对你做出承诺。",
        effect: () => {
          gameState.love += 2;
          gameState.mutsumiMood += 3;
          gameState.sakikoMood += 1;
          updateUI();
        }
      },
      {
        text: "“没什么，我可以应付。”",
        feedback:
          "睦看着你，沉默了很久。<br>" +
          "最终，她只是轻轻点了点头。<br>" +
          "“……嗯。”<br>" +
          "空气安静得让人心慌，你能听见她压抑着的呼吸声。",
        effect: () => {
          gameState.sakikoMood -= 2;
          gameState.mutsumiMood -= 1;
          updateUI();
        }
      }
    ],
    once: true
  },

  // ===== 12 次 =====
  {
    condition: (count, state) => count === 12,
    text:
      "你替<span class='mutsumi-text'>睦</span>包扎好伤口，她抬眼看向你，嘴角弯起一点笑：“祥真厉害，好像医生一样……”<br>" +
      "她的笑声很轻，却带着一点颤抖。<br>" +
      "你忽然察觉，她的眼神深处，有一丝掩不住的痛苦。",
    effect: () => {
      gameState.love += 3;
      gameState.mutsumiMood += 2;
      gameState.sakikoMood += 1;
      updateUI();
    },
    once: true
  },

  // ===== 15次（带选项）=====
  {
    condition: (count, state) => count === 15,
    text:
      "庇护所内静得出奇。你再次调动异能，水流环绕着<span class='mutsumi-text'>睦</span>的伤口。<br>" +
      "清澈的水渐渐变得浑浊，最后化作一缕黑色流进地面。<br>" +
      "她盯着那滩水，忽然轻声问：<br>" +
      "“祥，当时发烧时是不是也很痛？”<br>" +
      "“如果，有一天，我真的撑不下去……祥会怎么办？”",
    choices: [
      {
        text: "“我会陪你到最后一刻。”",
        feedback:
          "睦怔了一下，眼泪在眼眶里闪烁，没来得及落下，就被你握住的手指抹去。<br>" +
          "“……祥，”她低声说，“我希望你能活下去。”<br>" +
          "她的声音轻得几乎听不见，像是怕被夜吞没。",
        effect: () => {
          gameState.love += 6;
          gameState.sakikoMood += 3;
          gameState.mutsumiMood += 4;
          updateUI();
        }
      },
      {
        text: "“别说傻话，睦一定会好起来。”",
        feedback:
          "睦没有立刻回应，只是抬起头望着你。<br>" +
          "她的眼神很亮，却藏着一点不确定。<br>" +
          "过了很久，她轻轻点头，笑得有些用力。<br>" +
          "“嗯，我会努力的。”",
        effect: () => {
          gameState.love += 3;
          gameState.sakikoMood += 1;
          gameState.mutsumiMood += 2;
          updateUI();
        }
      }
    ],
    once: true
  }
],

//4.meal的
meal: [
    // ===== 5 次 =====
    {
        condition: (count, state) => count === 5,
        text: "你泡了一小壶红茶，茶包是探索时从破旧的便利店里翻出来的。<br>" +
        "<span class='sakiko-text'>祥：</span>“久违的味道啊……要是有睦喜欢的果汁就更好了。”<br>" +
        "睦接过杯子，双手捧着，小声回应：<br>" +
        "<span class='mutsumi-text'>“没关系，有祥喜欢的红茶就很好。”</span><br>" +
        "她轻轻吹了口气，茶香在空气里散开,满足于此刻的宁静。",
        effect: () => {
            gameState.love += 2;
            gameState.mutsumiMood += 2;
            gameState.sakikoMood += 1;
            updateUI();
        },
        once: true
    },

    // ===== 8 次（带选项）=====
    {
        condition: (count, state) => count === 8,
        text: "你找到一小杯自热火锅。<br>" +
        "正要分食时，<span class='mutsumi-text'>睦</span>从碗里夹出一片腌黄瓜，递到你面前：<br>" +
        "“祥，多吃点。”<br>" +
        "那片黄瓜在叉子上泛着浅黄的光，像是仅存的柔软日常。",
        choices: [
            {
                text: "“睦更喜欢这个，自己留着吧。”",
                feedback: "她愣了一下，耳尖微红，最终还是轻轻咬下叉子上的那片黄瓜。<br>" +
                "<span class='mutsumi-text'>睦：</span>“……谢谢。”<br>" +
                "声音细得几乎听不见，却藏着一种小小的幸福。",
                effect: () => {
                    gameState.love += 2;
                    gameState.mutsumiMood += 3;
                    gameState.sakikoMood += 1;
                    updateUI();
                }
            },
            {
                text: "“谢谢，正好配茶。”",
                feedback: "你笑着接过，咬下一口。<br>" +
                "淡淡的咸味混着红茶的香气，竟有种怀念的温度。<br>" +
                "睦看着你，眼神柔软。<br>" +
                "<span class='mutsumi-text'>睦：</span>“祥喜欢就好。”",
                effect: () => {
                    gameState.love += 2;
                    gameState.mutsumiMood += 1;
                    gameState.sakikoMood += 2;
                    updateUI();
                }
            }
        ],
        once: true
    },

    // ===== 12 次 =====
    {
        condition: (count, state) => count === 12,
        text: "你在旧货架深处找到一个已经泛白的鲷鱼烧包装。<br>" +
        "虽然早已不新鲜，但那味道依旧让人怀念。<br>" +
        "睦轻轻捧着，低声笑：“……想起以前和祥一起吃的时候。”<br>" +
        "你看着她的笑，心里忽然涌上一种说不出的酸。<br>" +
        "那是温柔、却也遥远的记忆。",
        effect: () => {
            gameState.love += 4;
            gameState.sakikoMood += 2;
            gameState.mutsumiMood += 2;
            updateUI();
        },
        once: true
    },

    // ===== 15 次（带选项）=====
    {
        condition: (count, state) => count === 15,
        text: "你们坐在破旧的桌前，<br>" +
        "分着最后一点用异能净化过的水冲泡的速溶果汁粉。<br>" +
        "睦抿了一口，甜味淡得几乎尝不出来。<br>" +
        "她抬起眼，声音轻得像叹息：祥……要是以后真的什么都没有了，还能一起喝这个吗？需要现在就种植吗？”",
        choices: [
            {
                text: "“一定会有的。”",
                feedback: "她怔了怔，随即低下头思考。<br>" +
                "<span class='mutsumi-text'>睦：</span>“……那到时候，我们一起种水果吧，那个比较健康。”<br>" +
                "她的笑有点笨拙，却让那一刻的黑夜变得温柔。",
                effect: () => {
                    gameState.love += 6;
                    gameState.sakikoMood += 3;
                    gameState.mutsumiMood += 4;
                    updateUI();
                }
            },
            {
                text: "“放心吧，下次我一定帮你找到黄瓜籽。”",
                feedback: "她愣了一下，忍不住笑出了声：<br>" +
                "<span class='mutsumi-text'>睦：</span>“哈哈……祥真是的。”<br>" +
                "笑声轻轻飘散在废墟里，像是世界依旧有希望的证明。",
                effect: () => {
                    gameState.love += 3;
                    gameState.mutsumiMood += 3;
                    gameState.sakikoMood += 2;
                    updateUI();
                }
            }
        ],
        once: true
    }
],


 //5.休息 午休
rest_noon: [
    // ===== 午睡 5 次 =====
    {
        condition: (count, state) => count === 5,
        text: 
        "阳光从破碎的窗帘缝隙洒进来，尘埃在空气里慢慢漂浮。<br>" +
        "你刚闭上眼，就感觉有人在轻轻动。<br>" +
        "<span class='mutsumi-text'>睦</span>弯下腰，小心地为你盖上一层薄毯。<br>" +
        "“祥……要好好休息。”<br>" +
        "她的声音很轻，像怕惊醒什么珍贵的梦。",  
        effect: () => {
            gameState.stamina += 10;
            gameState.mutsumiMood += 2;
            gameState.sakikoMood += 1;
            updateUI();
        },
        once: true
    },

    // ===== 午睡 10 次（带选项）=====
    {
        condition: (count, state) => count === 10,
        text: 
        "你醒来的时候，阳光已经倾斜了。<br>" +
        "眼前是<span class='mutsumi-text'>睦</span>的脸——近得让你能看清她睫毛的弧度。<br>" +
        "她正安静地看着你，金色的眼睛倒映着你微动的呼吸。<br>" +
        "“……祥睡得很安稳呢。真好。”<br>" +
        "她的手在半空停着，像是在犹豫——那距离，只差一瞬。",
        choices: [
            {
                text: "装作没睡醒，任由她靠近",
                feedback: 
                "你没有出声，只是微微呼吸。<br>" +
                "那只手终于落下，轻轻碰到你的睫毛。<br>" +
                "她的指尖冰凉，却带着颤抖的温度。<br>" +
                "片刻后，她又慌忙收回手，唇角掠过几乎听不见的呢喃：<br>" +
                "“……辛苦了。”<br>" +
                "风从窗缝里吹进来，你假装没听见，只觉得胸口一阵发烫。",
                effect: () => {
                    gameState.love += 4;
                    gameState.mutsumiMood += 6;
                    gameState.sakikoMood += 3;
                    updateUI();
                }
            },
            {
                text: "突然睁眼，抓住她的手",
                feedback: 
                "你一把握住那只悬在半空的手。<br>" +
                "睦的肩膀微微一抖，整个人都僵住了。<br>" +
                "“……祥！” 她的耳根一下子红透，想挣脱却没动。<br>" +
                "你笑了笑：“想摸就直说啊。”<br>" +
                "她低下头，指尖被你握着，安静得像被困在呼吸之间。",
                effect: () => {
                    gameState.love += 2;
                    gameState.sakikoMood += 3;
                    updateUI();
                }
            }
        ],
        once: true
    }
],

//晚上的睡觉
rest_night: [
    // ===== 夜晚 3 次 =====
    {
        condition: (count, state) => count === 3,
        text: "你因为提前入睡，比平时更早醒来。<br>" +
        "黑暗里，微弱的光从窗缝透进来。<br>" +
        "睦正坐在你床边，直直地看着你，眼神有些慌乱。<br>" +
        "<span class='mutsumi-text'>“……祥，我睡不着。”</span> <br>" +
        "她的声音细得像要被夜色吞掉。你轻声回应，伸手摸了摸她的发顶，那一瞬间，她的肩微微颤了一下,然后蹭蹭你的手。",
        effect: () => {
            gameState.mutsumiMood -= 3;
            gameState.sakikoMood += 1;
            gameState.love += 2;
            updateUI();
        },
        once: true
    },

    // ===== 夜晚 7 次 =====
    {
        condition: (count, state) => count === 7,
        text: "你在半梦半醒间翻了个身，意外碰到一只冰凉的手。<br>" +
        "迷糊的你被吓得轻抽了一口气。<br>" +
        "但在你意识到什么情况时，你握紧了那只手，用掌心的温度慢慢包裹她的冰冷。<br>" +
        "片刻后，她的指尖轻轻回握。<br>" +
        "<span class='mutsumi-text'>“……手指，变得温暖了。”</span><br>" +
        "她的语气轻柔得像梦。你看不清她的表情，只听见两人的呼吸渐渐重叠。",
        effect: () => {
            gameState.love += 3;
            gameState.mutsumiMood += 4;
            updateUI();
        },
        once: true
    },

    // ===== 夜晚 10 次  =====
    {
        condition: (count, state) => count === 10 && gameState.acceptedConfession,
        text: "夜色深沉。<br>" +
        "祥子刚闭上眼，就察觉到一股微弱的热气靠近。<br>" +
        "她睁开眼，睦正伏在她身侧，眼神混乱而不安。<br>" +
        "<span class='sakiko-text'>祥：</span>“睦？怎么了，是哪里不舒服吗？”<br>" +
        "睦的唇在颤，她用力咬住下唇，眼里泛着湿意。<br>" +
        "<span class='mutsumi-text'>睦：</span>“……祥，对不起……我只是、很害怕……”",
        choices: [
            {
                text: "（抱住她）“没关系，我在。”",
                feedback: "你没有多问，只是伸手轻轻抱住她。<br>" +
                "她先是愣了一下，随后紧紧回抱你。<br>" +
                "她的身体微微发抖，指尖死死抓着你的衣角。<br>" +
                "<span class='mutsumi-text'>“……再紧一些，还不够。”<.span><br>" +
                "黑暗里，你听见她的心跳，与自己的重叠。<br>" +
                "你想，你大概懂得睦想要什么了。",
                effect: () => {
                    gameState.love += 10;
                    gameState.sakikoMood += 8;
                    gameState.mutsumiMood += 10;
                    gameState.infection += 3;
                    updateUI();
                }
            },
            {
                text: "轻声安抚，摸了摸她的头",
                feedback: "你抬手按住她的肩，声音温和：“别怕，我在这，快睡吧。”<br>" +
                "她怔了怔，眼神闪了闪，像是在努力压制住什么欲望。<br>" +
                "你抚摸着她的发顶，感受那一层细微的颤抖慢慢平息。<br>" +
                "夜色安静得只剩下呼吸声。<br>" +
                "她靠在你身旁，没再说话，只是轻轻握住你的手。",
                effect: () => {
                    gameState.love += 2;
                    gameState.mutsumiMood -= 1;
                    updateUI();
                }
            }
        ],
        once: true
    }
],


//6.探索 - 房子独立类
  explore_house: [
    {
        condition: (count, state) => count === 3,
        text: "屋里弥漫着潮湿与灰尘的气味。<br>" +
              "睦蹲在破旧的橱柜前，拨开一层碎木和尘埃，忽然停下。<br>" +
              "她从阴影里捧出一个几乎完好的小茶包，指尖微微一颤。<br>" +
              "”这是……红茶吧？祥最喜欢的。“她的声音轻得几乎要被风带走。",
        choices: [
            {
                text: "收下茶包",
                feedback: "你伸手接过茶包，指尖触到她的手背。<br>" +
                          "睦微微抬眼，金色的瞳里闪着一点光，随后轻轻点头。<br>" +
                          "那一刻，你从她的瞳孔里清晰可见地她的开心。",
                effect: () => {
                    gameState.love += 2;
                    gameState.sakikoMood += 3;
                    updateUI();
                }
            },
            {
                text: "递给睦",
                feedback: "你把茶包重新放进她的掌心。<br>" +
                          "“等以后安全了，再和睦你一起喝。”你说。<br>" +
                          "睦怔了怔，指尖紧了紧，像是想仔细保护那个小茶包。<br>" +
                          "“嗯……”她的应声几乎听不清，却带着一点笑意。",
                effect: () => {
                    gameState.love += 2;
                    gameState.mutsumiMood += 3;
                    updateUI();
                }
            }
        ],
        once: true
    },
    {
        condition: (count, state) => count === 7,
        text: "破裂的桌脚支撑着一角残木。<br>" +
              "你弯下腰，从灰尘下捡出一张泛黄的照片。<br>" +
              "画面里的人都在笑——那种已经在世界上消失的笑。<br>" +
              "睦盯着照片，指尖缓慢滑过其中一个女孩的脸。<br>" +
              "“如果没有末世，”她低声道，“我们是不是也能……这样？”",
        choices: [
            {
                text: "紧紧握住她的手",
                feedback: "你没有回答，只是伸手握住她冰凉的手。<br>" +
                          "她轻轻一颤，随后回握住你。<br>" +
                          "照片在风里轻响，照片地女孩还在微笑。<br>" +
                          "那一刻，不需要语言回答，因为没有如果。",
                effect: () => {
                    gameState.love += 5;
                    gameState.sakikoMood += 4;
                    gameState.mutsumiMood += 4;
                    updateUI();
                }
            },
            {
                text: "转移话题",
                feedback: "你轻声说：“继续找吧，说不定还能找到吃的。”<br>" +
                          "睦应了声“嗯”，却没有立刻动。<br>" +
                          "她的眼神仍停留在那张照片上，神情一点点暗淡下去。",
                effect: () => {
                    gameState.mutsumiMood -= 1;
                    updateUI();
                }
            }
        ],
        once: true
    }
],


//6.探索 - 独自独立类
   explore_alone: [ 
    {
        condition: (count, state) => count === 3,
        text: "你刚背上包准备出门，睦忽然从后面拉住你的袖子。<br>" +
              "她抬头望着你，眼神有些不安。<br>" +
              "“……路上小心，我会等你回来。”她的声音轻得几乎听不见。",
        choices: [
            {
                text: "轻轻抱她一下",
                feedback: "你没有多说什么，只是伸手将她抱进怀里。<br>" +
                          "她的身体微微一僵，片刻后才放松下来。<br>" +
                          "脸颊靠在你肩头，呼吸轻颤，你回答道：“我会早点回来。”",
                effect: () => {
                    gameState.love += 3;
                    gameState.mutsumiMood += 2;
                    gameState.sakikoMood += 1;
                    updateUI();
                }
            },
            {
                text: "只是点头离开",
                feedback: "你只是轻轻点头，然后转身离去。<br>" +
                          "脚步声渐远时，她松开的手指在空气里微微颤抖。<br>" +
                          "“……早点回来。”最后那句低语被微风带走了，回荡在空气里。",
                effect: () => {
                    gameState.love += 1;
                    gameState.mutsumiMood -= 1;
                    updateUI();
                }
            }
        ],
        once: true
    },
    {
        condition: (count, state) => count === 7,
        text: "夜色沉沉。<br>" +
              "你推开门的那刻，睦立刻迎了上来。<br>" +
              "她的目光一瞬间落在你手臂的擦伤上，整个人僵住。<br>" +
              "“……祥，怎么受伤了？”她的声音带着颤抖。",
        choices: [
            {
                text: "（安慰她)“没事的，只是摔倒，不是被丧尸抓伤”",
                feedback: "你伸手摸了摸她的头发，轻声道：“真的没事。”<br>" +
                          "睦先是怔住，然后去那医药箱处理你的伤口。<br>" +
                          "她的指尖死死抓着棉花棒与碘酒，在你的伤口擦拭。<br>" +
                          "“……对不起。”你听见她愧疚地声音。",
                effect: () => {
                    gameState.love += 6;
                    gameState.mutsumiMood += 5;
                    updateUI();
                }
            },
            {
                text: "装作轻松",
                feedback: "你笑着说：“这点小伤不算什么。”<br>" +
                          "睦没有笑，只是默默地取出药棉，为你包扎。<br>" +
                          "她的手在颤，但每一个动作都极为认真。<br>" +
                          "“下次……带我一起，好吗。”",
                effect: () => {
                    gameState.love += 2;
                    gameState.sakikoMood += 1;
                    updateUI();
                }
            }
        ],
        once: true
    }
],

//和睦外出
explore_withMutsumi: [
    {
        condition: (count, state) => count === 3,
        text: "街道的风夹着灰尘吹过。<br>" +
              "睦始终紧紧跟在你身后，几乎没有发出声响。<br>" +
              "直到你回头，她才轻声说：“祥……注意安全。”<br>" +
              "那语气像是对小孩一般小心翼翼的叮嘱。",
        choices: [
            {
                text: "你顿时停下，等她牵住她的手",
                feedback: "你停下脚步，伸手牵住她的手。<br>" +
                          "睦微微一愣，随后轻轻回握。<br>" +
                          "她的手很冰凉，但在你的掌心里渐渐变得温热。<br>" +
                          "废墟的世界依旧荒芜，却因为这一瞬间而变得柔软。",
                effect: () => {
                    gameState.love += 5;
                    gameState.sakikoMood += 3;
                    gameState.mutsumiMood += 5;
                    updateUI();
                }
            },
            {
                text: "你急着完成探索，快步向前走",
                feedback: "你没有听见睦的话，只是继续往前走。<br>" +
                          "脚步声在空旷的街上回荡，显得格外孤单。<br>" +
                          "睦在身后停了半拍，低着头跟上，<br>" +
                          "她的手指轻轻攥紧，又慢慢松开。",
                effect: () => {
                    gameState.love += 1;
                    gameState.mutsumiMood -= 2;
                    updateUI();
                }
            }
        ],
        once: true
    },

    {
        condition: (count, state) => count === 7,
        text: "夜色笼罩下的归途，你和睦并肩走着。<br>" +
              "忽然，她从怀里掏出一瓶皱巴巴的芒果汁。<br>" +
              "“这是给祥的。”<br>" +
              "她的笑有些腼腆，却一如往常的淡定。<br>" +
              "微风掠过，空气里混着果香与不安的心跳。",
        choices: [
            {
                text: "和她分享饮料",
                feedback: "你接过饮料，拧开瓶盖，喝了一口再递给她。<br>" +
                          "睦迟疑片刻，还是接过抿了一口。<br>" +
                          "她的睫毛轻轻颤动，脸颊染上柔和的红晕。<br>" +
                          "“……好甜。”她轻声说，不知是在说饮料，还是别的什么。",
                effect: () => {
                    gameState.love += 7;
                    gameState.mutsumiMood += 6;
                    gameState.sakikoMood += 3;
                    updateUI();
                }
            },
            {
                text: "靠近她，仔细观察她的表情",
                feedback: "你没有接过饮料，只是凝视着她。<br>" +
                          "睦愣住了，呼吸微乱。<br>" +
                          "你突然俯身吻上她的唇，像是恶作剧一般，芒果汁的甜味在彼此唇齿间散开。<br>" +
                          "她的指尖颤抖着轻轻抓住你的衣角，<br>" +
                          "那一刻你想，都是夜色太美惹的祸。",
                effect: () => {
                    gameState.love += 10;
                    gameState.sakikoMood += 5;
                    gameState.mutsumiMood += 8;
                    updateUI();
                }
            }
        ],
        once: true
    }
],

// 7. 加固房子
reinforceHouse: [
    {
        condition: (count, state) => count === 3,
        text: "你们把收集到的木板钉在窗户上，屋内终于安静了些。<br>" +
              "睦递来一把钉子，声音低低的：“这样……会好一点。”<br>" +
              "你看了她一眼，她却只是呆呆地盯着你的琥珀色眼睛。",
        choices: [
            {
                text: "伸手揉揉她的头",
                feedback: "她愣了一下，耳尖微微发红，但没有拒绝。",
                effect: () => {
                    gameState.sakikoMood += 3;
                    gameState.mutsumiMood += 3;
                    updateUI();
                }
            }
        ],
        once: true
    },

    // 6次
    {
        condition: (count, state) => count === 6,
        text: "在加固的木墙上，你提议写下名字。<br>" +
              "睦沉默了一会儿，最终点头，用颤抖的手写下了“睦&祥”两个字。<br>" +
              "她盯着那字，声音轻得几乎听不见：“……这里，现在就是家了。”",
        choices: [
            {
                text: "开心的把睦抱进怀里",
                feedback: "她的身体僵了一瞬，随即靠在你怀里，能听见彼此心跳急促的声音。",
                effect: () => {
                    gameState.sakikoMood += 5;
                    gameState.mutsumiMood += 5;
                    gameState.love += 3;
                    updateUI();
                }
            },
            {
                text: "轻轻牵她的手",
                feedback: "她的指尖冰凉，但很快回握住你。",
                effect: () => {
                    gameState.love += 2;
                    updateUI();
                }
            }
        ],
        once: true
    },
    {
        condition: (count, state) => count === 9,
        text: "屋子几乎坚固如初。你在角落钉上一块写着“希望”的小木牌。<br>" +
              "睦看着木牌，低声说：“这是我们的希望，祥要好好的。”",
        choices: [
            {
                text: "“睦也要陪在我身边呢”",
                feedback: "你握住她的肩膀，注视着她。睦的眼神闪动，做出承诺：“嗯，我会的。”",
                effect: () => {
                    gameState.love += 5;
                    gameState.sakikoMood += 3;
                    gameState.mutsumiMood += 3;
                    updateUI();
                }
            },
            {
                text: "只是笑笑",
                feedback: "你开心的忘了回应。睦沉默的看着你片刻，叹了口气后轻轻把手放在了你手背上。",
                effect: () => {
                    gameState.love += 1;
                    updateUI();
                }
            }
        ],
        once: true
    },
    {
        condition: (count, state) => count === 12 && gameState.acceptedConfession,
        text: "夜幕下，屋子终于稳固得像真正的家。火光映在睦的脸上，她靠近你，声音颤抖：<br>" +
              "“祥……在家的话，可以做吗？。”<br>" +
              "她的眼神炽热，平日的冷静被彻底打破。",
        choices: [
            {
                text: "顺从心意，深深吻她",
                feedback: "你再也没有忍住，把她压在木墙边，深深吻住。<br>" +
                          "你们的唇舌交缠，贪婪的摄取彼此的体温，在末日下分享最后的温暖。<br>" +
                          "她紧紧抱住你，指尖抓住你的衣襟。破败的屋子，成了唯一的世界。",
                effect: () => {
                    gameState.love += 12;
                    gameState.sakikoMood += 8;
                    gameState.mutsumiMood += 10;
                    updateUI();
                }
            },
            {
                text: "克制，轻声回应",
                feedback: "你只是握住她的手，贴近额头。睦的眼里略带失落，却只是笑着说：“……开玩笑的。”",
                effect: () => {
                    gameState.love += 6;
                    gameState.sakikoMood += 4;
                    gameState.mutsumiMood += 5;
                    updateUI();
                }
            }
        ],
        once: true
    }
 ]

};

window.actionEvents = actionEvents;
