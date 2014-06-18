# Imports
import templates, versioninfo


# Fields
const title = "iRC Familiar"


# Procedures
template view*(isMobile, body: stmt) =
    bind title

    # Fields
    template css =
        when defined(debug):
            result.add "/css/style.css"
        else:
            result.add "/css/style.min.css"

    # Templated fields
    template mobile_class = result.add if isMobile: " class=mobile" else: ""
    template body_tmpl    = body
    template title_tmpl   = result.add title

    tmpl html"""
        <meta name=viewport content="width=device-width,initial-scale=1,maximum-scale=1">
        <meta name="mobile-web-app-capable" content=yes>
        <link href=${css} rel=stylesheet>
        <link href=/favicon.ico rel=icon>
        $when defined(scripts) {
            ${ scripts }
        }
        <title>${title_tmpl}</title>
        <header${ mobile_class }>
            <span>${title_tmpl}</span>
            $when defined(header) {
                ${ header }
            }
        </header>
        <section id=content${ mobile_class }>
            ${ body_tmpl }
        </section>
        $if showFooter {
            <footer>
                powered by <a href="http://nimrod-code.org" target=_blank>nimrod</a>,
                <a href="http://typescriptlang.org" target=_blank>typescript</a>,
                &amp; <a href="https://github.com/dom96/jester" target=_blank>jester</a>
                | get the source
            </footer>
        }
        """