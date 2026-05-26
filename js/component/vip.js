var swiper = null
Vue.component('vip', {
    template: `
        <div class="vip-page">
            <div class="integral_list">
            <div class="top-portion">
                <div v-if="isLogin" class="vip_btn" @click="onPoints">{{$t('vipUpgradeNow')}}</div>
                <div v-if="!isLogin" class="vip_btn" @click="onLogin()">{{$t('vipViewMyBenefits')}}</div>
                <!-- tab切换 -->
                <div class="swiper vip_swiper">
                    <div class="swiper-wrapper">
                    <div class="swiper-slide" v-for="(item,index) in vipGradeInfo" :key="index">
                        <div v-if="item.levelGiftId!==null" class="vip_grade_icon" @click="onVipGradePopup(item)">
                        </div>
                        <h2>{{item.name}}</h2>
                        <div class="vip_gift_lv">V{{item.level}}</div>
                        <p>
                        <span v-if="item.givePoints>0">{{$t('vipBonusPoints', {num: item.givePoints})}}</span>
                        </p>
                        <h3>{{item.currentExp}}/{{item.exp}}</h3>
                        <div class="vip_load"><span :style="{ width: item.width+'%' }"></span>
                        </div>
                        <p v-if="index<vipGradeInfo.length-1">
                        {{$t('EXPNeededToReachLv',{lv:item.nextLevelName,EXP:item.currentExp>item.nextLevelExp ? '0'
                        :
                        item.nextLevelExp-item.currentExp})}}
                        </p>
                        <p v-if="index==vipGradeInfo.length-1">
                        {{$t('vipRequiresMoreEXPtoTheMaxLevel', {num: item.nextLevelExp-item.currentExp})}}
                        </p>
                    </div>
                    <div class="swiper-slide expectation">{{$t('vipStayTuned')}}</div>
                    </div>
                </div>
                <div class="vip_arrow"></div>
                </div>
                <!-- 礼包列表 -->
                <div class="vip_gift">
                    <div class="gift_header"></div>
                    <div class="part_one"></div>
                    <div class="vip_gift_list" v-for="(item,index) in vipGradeInfo" :key="index">
                    <p class="part_one_content gradient_text">
                       {{item.name}}{{$t('vipWithPerk',{num:item.privileges.length})}}</p>
                    <div class="vip_icon vip_gift_item" v-for="(itemGift,indexGift) in item.privileges"
                        @click="onVipGift(itemGift,index+1)">
                        <div class="vip_gift_img"><img :src="itemGift.icon || getGeneratedRewardImage(itemGift.name, 'vip')"
                          @error="setFallbackImage($event,itemGift.name,'vip')" alt=""></div>
                        <div class="vip_gift_text">{{itemGift.name}}</div>
                    </div>
                    </div>
                    <div class="vip_gift_list">
                    <p class="part_one_content gradient_text">{{$t('moreRewardsAreComing')}}</p>
                    <div class="expectation_img"></div>
                    </div>
                    <div class="gift_footer"></div>
                </div>

                </div>
                <!--会员赠送积分弹窗 -->
                <div class="popup_give" v-if="isPopupGive">
                    <div class="vip_popup_close" @click="isPopupGive=false;changeMask(false)"></div>
                    <h2>{{vipGiftInfo.titleName}}</h2>
                    <div class="popup_give_cent" v-html="vipGiftInfo.description"></div>
                    <div class="vip_popup_get_btn" @click="onGiveUrl()" v-if="isPopupGiveBtn">{{vipGiftInfo.btnName}}</div>
                </div>
                <!-- 会员礼包弹窗 -->
                <div class="popup_vip_prize" v-if="isPopupPrize">
                  <div class="vip_popup_close" @click="isPopupPrize=isVipPopupBtn=false;changeMask(false)"></div>
                  <h2>{{vipGiftInfo.titleName}}</h2>
                  <ul>
                    <li v-for="item in vipGiftInfo.goodsInfos">
                      <div><img :src="item.goodsPic || getGeneratedRewardImage(item.goodsName, 'vip')"
                        @error="setFallbackImage($event,item.goodsName,'vip')" alt=""></div>
                      <p>{{item.goodsName}}*{{item.goodsNum}}</p>
                    </li>
                  </ul>
                  <div :class="['vip_popup_get_btn',isVipPopupBtn ? 'disabledBtn':'']" @click="()=>debounceFn()">
                    {{$t('vipClaim')}}</div>
                  <p class="popup_vip_prize_tips">{{$t('vipMailGame')}}</p>
                </div>
                <!-- 会员背包记录 -->
                <div class="popup_vip_knapsack" v-if="isPopupKnapsack">
                  <div class="vip_popup_close" @click="isPopupKnapsack=false;changeMask(false)"></div>
                  <h2>{{$t('vipBag')}}</h2>
                  <div class="knapsack_title">
                    <span>{{$t('exchangeDate')}}</span>
                    <span>{{$t('vipItem')}}</span>
                  </div>
                  <ul>
                    <li v-for="item in vipKnapsackData">
                      <span>{{item.creationTime | utcTimeFormat}}</span>
                      <span @click="onVipKnapsack(item)">{{item.name}}</span>
                    </li>
                  </ul>
                  <!-- <div class="vip_icon vip_popup_btn" @click="onReceiveVipGift()">按钮</div> -->
                </div>
                
        </div>
    `,
    props:{
      isContainerList:{
        type:Number,
        required:true
      },
      isLogin:{
          type:Boolean,
          required:true
      },
      selectedInfo:{
        type:Array,
        required:true
      }
    },
    data() {
        return {
            areaData: areaData,
            vipGradeIndex: 0, //会员当前等级
            vipGradeInfo: [], //会员等级信息
            vipGiftInfo: false, //会员礼包信息
            isPopupGive: false, //是否会员赠送弹窗
            isPopupGiveBtn: false, //是否会员赠送弹窗按钮
            isPopupPrize: false, //是否会员礼包弹窗
            isPopupKnapsack: false, //是否会员背包记录弹窗
            vipKnapsackData: [], //会员背包数据
            isScroll: true, //会员礼包是否可以滚动
            vipLastId: 0, //会员背包默认lastId
            isVipPopupBtn: false,
        };
    },
    created (){
    },
    filters: {
      utcTimeFormat (value) {
        let date = new Date(value + utc * 3600 * 1000);
        return date.toJSON().substr(0, 19).replace('T', ' ');

      },
      rangeValueText (value) {
        return vue.$t(`rewardsRangeValue${value}`)
      }
    },
    watch: {
        isContainerList: function (newV,oldV) {
            if (newV === 1 && swiper == null) {
                this.SwiperNew()
            }
        },
    },
    methods: {
        getGeneratedRewardImage,
        setFallbackImage,
        init(){
          getVipBenefits({ actorId: this.selectedInfo.actorId, worldId: this.selectedInfo.worldId }, res => {
            // this.vipGradeInfo = res.data
            this.vipGradeInfo = []
            this.vipGradeIndex = null
            res.data.forEach((item, index) => {
              if (item.currentLevelId !== null) {
                this.vipGradeIndex = index
              }
              var benefitsArr = item
              if (item.currentExp > item.exp) {
                benefitsArr.width = 100
              } else {
                benefitsArr.width = Math.floor(item.currentExp / item.exp * 100)
              }
              this.vipGradeInfo.push(benefitsArr)
            })
            this.vipGradeIndex = this.vipGradeIndex === null ? 0 : this.vipGradeIndex
            this.$toast.clear()
            if (this.isContainerList === 1) {
              this.SwiperNew()
            }
          })
        },
        changeMask(type){
          this.$emit('changemask',type)
        },
        onPoints () {
          thinking.track('upgrade_now', {
            // role_id:this.selectedInfo.actorId,
            // role_name:this.selectedInfo.actorName,
            account_id:this.selectedInfo.userId,
            account_name:this.selectedInfo.userName
          })
          if (this.selectedInfo.gameVersion && this.selectedInfo.actorId) {
            window.open(`${payUrl}?gameVersion=${this.selectedInfo.gameVersion}&actorId=${this.selectedInfo.actorId}`, '_blank')
          } else {
            window.open(payUrl, '_blank')
          }
        },
        // sdk登录
        onLogin () {
          this.$emit('onlogin')
        },
        SwiperNew () {
            if (swiper) {
              swiper.destroy(true)
            }
            this.onSwiper()
          },
        onSwiper () {
          this.$nextTick(() => {
            swiper = new Swiper(".vip_swiper", {
              initialSlide: this.vipGradeIndex || 0,
              slidesPerView: 'auto',
              centeredSlides: true,
              observer: true,
              observeParents: true,
              loop: true,
              on: {
                  transitionEnd:function(swiper){
                      var index = $('.swiper-slide-active').attr('data-swiper-slide-index');
                      $('.vip_gift_list').hide().eq(index).show()
                  }
              },
            });
            $('.swiper-slide').each(function () {
              $(this).addClass(`swiper-slide-${$(this).attr('data-swiper-slide-index')}`)
            })
            $('.vip_gift_list').hide().eq(this.vipGradeIndex || 0).show()
          })
        },
        debounceFn:debounce(function(){
            this.onReceiveVipGift()
        },300),
        onReceiveVipGift () {
          var data = {
            id: this.vipGiftInfo.id,
            solutionId: this.vipGiftInfo.solutionId,
            actorInfo: this.selectedInfo,
          }
          
          getVipGift({ ...data }, res => {
            $('.popup_vip_prize .vip_popup_get_btn').addClass('prohibit')
            if (res.code === 5004) {
              this.$toast.success(this.$t('returnTips5004'));
            }

          })
        },
        touristChangeLang () {
            getVipTouristBenefits({ gameId: gameId, gameVersion: this.areaData[0].gameVersion }, res => {
              this.vipGradeInfo = []
              this.vipGradeIndex = null
              res.data.forEach((item, index) => {
                if (item.currentLevelId !== null) {
                  this.vipGradeIndex = index
                }
                var benefitsArr = item
                if (item.currentExp > item.exp) {
                  benefitsArr.width = 100
                } else {
                  benefitsArr.width = Math.floor(item.currentExp / item.exp * 100)
                }
                this.vipGradeInfo.push(benefitsArr)
              })
              this.vipGradeIndex = this.vipGradeIndex === null ? 0 : this.vipGradeIndex
              // if (swiper !== null) {
              //   this.SwiperNew()
              // } else {
              //   this.onSwiper()
              // }
              if (this.isContainerList === 1) {
                this.SwiperNew()
              }
              this.$toast.clear()
            })
        },
        onGiveUrl () {
          if (this.vipGiftInfo.linkUrl !== null) {
            window.open(this.vipGiftInfo.linkUrl, '_blank')
          } else {
            this.isPopupGive = false
            this.changeMask(false)
          }
        },
        onVipKnapsack (data) {
          let vipKnapsackData = []
          let level = 0
          this.vipGradeInfo.forEach((item,i) => {
            item.privileges.forEach(el => {
              if (el.id === data.giftId) {
                vipKnapsackData = el
                level = i+1
              }
            })
          })
          if (vipKnapsackData.length === 0) return
          this.isPopupKnapsack = false
          this.$nextTick(() => {
            this.onVipGift(vipKnapsackData,level)
            this.isVipPopupBtn = true
          })
        },
        onVipGradePopup (item) {
            if (!this.isLogin) {
              this.onLogin()
              return false
            }
            item.privileges.forEach(e => {
              if (e.id === item.levelGiftId) {
                this.vipGiftInfo = e
                this.isPopupPrize = true
                this.changeMask(true)
                this.isVipPopupBtn = e.receiveStatus === 1
              }
            })
        },
        onVipGift (item,level) {
            if (!this.isLogin) {
              this.onLogin()
              return false
            }
            this.vipGiftInfo = item
            // jumpType:跳转类型 0:无跳转，1:跳转链接
            // type:特权类型(0:通用类，1:礼包类，2:充值赠送类)
            // alterType:是否弹窗 0:无弹框，1:有弹框
  
            // 充值赠送类 type = 2  alterType:弹框 =1  jumpType:跳转=1  && url 不为空  打开弹框点击 btnName 跳到 打开linkurl
            // 充值赠送类 type = 2  alterType:弹框 =1  jumpType:跳转=0  || url 为空   打开弹框点击  btnName 关闭弹框
  
            // 礼包类 type = 1  alterType:弹框 =1 弹出框
            // 礼包类 type = 1  alterType:弹框 =0 点击无效
  
            //alterType:弹框 =0  jumpType:跳转=1  && url 不为空  跳到linkurl

            if(item.type === 0 && this.selectedInfo.memberLevel<level){
              return this.$toast.fail(this.$t('returnTips5005'));
            }
            if (item.alterType === 1) {
              if (item.type == 1) {
                // 礼包
                this.isPopupPrize = true
                this.changeMask(true)
                this.isVipPopupBtn = item.receiveStatus === 1
              } else {
                // 赠送积分
                this.isPopupGiveBtn = item.btnName !== null
                this.isPopupGive = true;
                this.changeMask(true)
                if (!isMobile) {
                  this.$nextTick(() => {
                    $('.popup_give').css({ 'top': window.scrollY + 200 + "px" })
                  })
                }
  
              }
            } else if (item.linkUrl !== null) {
              window.open(item.linkUrl, '_blank')
            }
        },
        onKnapsack () {
          if (!this.isLogin) {
            this.onLogin()
            return false
          }
          this.isPopupKnapsack = true
          this.changeMask(true)
          if (!isMobile) {
            this.$nextTick(() => {
              $('.popup_vip_knapsack').css({ 'top': window.scrollY + 50 + "px" })
            })
          }
          this.vipKnapsackData = []
          this.vipLastId = 0
          getBackpack({ actorId: this.selectedInfo.actorId, worldId:this.selectedInfo.worldId, lastId: this.vipLastId, pageSize: 20 }, res => {
            this.vipKnapsackData =res.data
            if (res.data === null || res.data.length < 20) return
            this.vipLastId = res.data[res.data.length - 1].id
            $('.popup_vip_knapsack ul').scroll(event => {
              var scrollTop = event.currentTarget.scrollTop;
              var scrollHeight = event.currentTarget.scrollHeight;
              var clientHeight = event.currentTarget.clientHeight;
              if (scrollTop + clientHeight >= scrollHeight) {
                if (!this.isScroll) return
                getBackpack({ actorId: this.selectedInfo.actorId, worldId: this.selectedInfo.worldId, lastId: this.vipLastId, pageSize: 20 }, resPage => {
                  this.vipKnapsackData.push(...resPage.data)
                  if (res.data === null || resPage.data.length < 20) {
                    this.isScroll = false
                    return
                  }
                  this.vipLastId = resPage.data[resPage.data.length - 1].id
                })
              }
            })
          })
        },
    }
});
