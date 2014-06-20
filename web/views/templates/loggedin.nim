# Imports
import templates
import master, versioninfo


# Procedures
template view*(isMobile: bool, body: stmt) =
    bind master.view

    template header = tmpl html"""
        <a class=menu-item id=toggle-statuses>hide joins/parts</a>
        <a class=menu-item id=theme>night mode</a>
        <a class="menu-item disabled" id=notifications>show notifications</a>
        <a id=settings>...</a>
        <a id=logout onclick="window.location='/logout'">logout</a>
        """

    template path =
        when defined(debug):
            result.add "/scripts/app.js"
        else:
            result.add "/scripts/app.min.js"

    template scripts =
        tmpl html"""<script src=${path} async></script>"""

    master.view(isMobile):
        body