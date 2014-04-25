require 'stringex'

module Jekyll
  class CategoryPage < Liquid::Tag

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
      categories.keys.sort_by{ |str| str.downcase }.each do |category|
        html << "<li><a href='/#{category_dir}/#{category.to_url}/'>#{category.capitalize}"
        html << "</a>"
        if @opts['counter']
          html << " [#{categories[category].count}]"
        end
        html << "</a></li>"
      end
      html
    end
  end

end

Liquid::Template.register_tag('category_page', Jekyll::CategoryPage)
