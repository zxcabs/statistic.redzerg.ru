server {
	server_name redzerg.ru;
	#root /home/user/share/websnake/www;
	#index index.html;

	#location ~ \.(css|jpg|js|ico) {
	#	root /home/user/share/blizzardtop.redzerg.ru/file/;
	#}
	
	location / {
		proxy_pass        http://localhost:4000;
		proxy_set_header  Host       $host;
		proxy_set_header  X-Real-IP  $remote_addr;
	}
}