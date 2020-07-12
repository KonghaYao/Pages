var vm = new Vue({
			el: '#app',
			data: {
				activeIndex: '1',
				searchText: '',
				webSearchResult: [],
			},
			mounted() {
				window.dp = new DPlayer({
					screenshot: true, //截屏
					hotkey: true,
					container: document.getElementById('dplayer'),
					video: {
						url: '',
					}

				});
				this.webSearch();
			},
			methods: {
				handleSelect(key, keyPath) {
					this.activeIndex = key
				},
				isURL() {
					this.searchText.search(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/) >=
						0 ? dp.switchVideo({
							url: vm.searchText,
						}, ) : this.webSearch()
				},
				webSearch() {
					this.webSearchResult = []
					this.$message({
						message: '搜索中，请稍后',
						type: 'success'
					});
					fetch('https://api.okzy.tv/api.php/provide/vod/?wd=' + this.searchText).then(res => res.json()).then(res =>{ res.list
						.forEach(i => {
							this.webSearchResult.push(i)
						})
						this.$message({
							message: '结果已经返回',
							type: 'success'
						});
						})
					
				},
				PlaySrc(e) {
					console.log(e.dataset.src)
					dp.switchVideo({
						url: e.dataset.src,
					});
					document.querySelector('.el-message-box__headerbtn').click();
					this.activeIndex=2
					this.$notify({
					          title: '视频播放',
					          message: '请等待加载'
					        });
					dp.play()
				},

				webSearchDetail(a, b) {
					console.log(a, b)
					this.$loading({
						lock: true,
						text: 'Loading',
						spinner: 'el-icon-loading',
						background: 'rgba(0, 0, 0, 0.7)'
					});
					fetch('https://api.okzy.tv/api.php/provide/vod/?ac=detail&ids=' + a['vod_id']).then(res => res.json()).then(res => {
						let i = res.list[0]
						let a = {
							name: i.vod_name,

							content: i.vod_content,
							pic: i.vod_pic,
							lang: i.vod_lang,
							year: i.vod_year
						}
						let b = i.vod_play_url.split('$$$').map(ii => {
							return ii.split('#')
						}).flat()

						a.src = b.filter(iii=>{
							let c = iii.split('$');
							return c[1].search(/\.m3u8/)>=0
						}).map(iii => {
							let c = iii.split('$');
							return `<button type="button" onclick='vm.PlaySrc(this)' data-src ='${c[1]}'>${c[0]}</button>`

						}).join('')

						this.$loading().close()
						this.$confirm(
							`<div>
									<img src='${a.pic}' style='height:400px'></img>
									<div>${a.content}</div>
									
								</div><div>
										${a.src}
									</div>`,
							a.name, {
								distinguishCancelAndClose: true,
								dangerouslyUseHTMLString: true
							})
					})
				},
			}

		})
		let ls = new Proxy({}, {
			set(lS, key, value) { //直接设置属性 当设置为空时 删除这个属性
				if (value) {
					value = typeof(value) === 'object' ? JSON.stringify(value) : value
					localStorage.setItem(key, value)
				} else {
					localStorage.removeItem(key)
				}

			},
			get(lS, key) {
				if (localStorage.hasOwnProperty(key)) {
					return localStorage.getItem(key)
				}
			}
		})
