# encoding: utf-8

# Tag Cloud for Octopress
# =======================
# 
# Description:
# ------------
# Easy output tag cloud and category list.
# 
# Syntax:
# -------
#     {% tag_cloud [counter:true] %}
#     {% category_list [counter:true] %}
# 
# Example:
# --------
# In some template files, you can add the following markups.
# 
# ### source/_includes/custom/asides/tag_cloud.html ###
# 
#     <section>
#       <h1>Tag Cloud</h1>
#         <span id="tag-cloud">{% tag_cloud %}</span>
#     </section>
# 
# ### source/_includes/custom/asides/category_list.html ###
# 
#     <section>
#       <h1>Categories</h1>
#         <ul id="category-list">{% category_list counter:true %}</ul>
#     </section>
# 
# Notes:
# ------
# Be sure to insert above template files into `default_asides` array in `_config.yml`.
# And also you can define styles for 'tag-cloud' or 'category-list' in a `.scss` file.
# (ex: `sass/custom/_styles.scss`)
# 
# Licence:
# --------
# Distributed under the [MIT License][MIT].
# 
# [MIT]: http://www.opensource.org/licenses/mit-license.php
# 
require 'stringex'

module Jekyll
	class CategoryList < Liquid::Tag

		def initialize(tag_name, markup, tokens)
			@opts = {}
			if markup.strip =~ /\s*counter:(\w+)/i
				@opts['counter'] = ($1 == 'true')
				markup = markup.strip.sub(/counter:\w+/i,'')
			end
			super
		end

		def render(context)
			html = ""
			config = context.registers[:site].config
			category_dir = config['category_dir']
			categories = context.registers[:site].categories

			count=0
			count_limit = 8

			categories.keys.sort_by{ |str| str.downcase }.each do |category|
				if count < count_limit
					html << "<li><a href='/#{category_dir}/#{category.to_url}/'>#{category}"
					if @opts['counter']
						html << " (#{categories[category].count})"
					end
					html << "</a></li>"
				elsif count == count_limit
					html << "<li><a href ='/#{category_dir}/'>more...</a></li>"
				end
				count = count + 1
			end
			html
		end
	end

end
Liquid::Template.register_tag('category_list', Jekyll::CategoryList)
