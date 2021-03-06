#! /usr/bin/python
# -*- coding: utf-8 -*-
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>
#
# @author : pascal.fautrero@ac-versailles.fr

import Tkinter
import tkFileDialog
from tooltip import ToolTip

import gettext
import locale


class IAParams(Tkinter.Frame):

    def __init__(self, root, parent, langPath, imagesPath):

        Tkinter.Frame.__init__(self, root)

        try:
            t = gettext.translation("xia-converter", langPath, languages=[locale.getdefaultlocale()[0]])
        except:
            t = gettext.translation("xia-converter", langPath, languages=['en_US'])
        translate = t.ugettext

        self.root = root
        self.parent = parent
        self.resizeCoeff = parent.resize

        if parent.options["export_type"] == "local":
            self.indexStandalone_param = 0
        elif parent.options["export_type"] == "singlefile":
            self.indexStandalone_param = 1
        else:
            self.indexStandalone_param = 0

        # define images
        self.resize_img = {}
        self.resize_img[0]= Tkinter.PhotoImage(file=imagesPath + \
            "/resize1.gif")
        self.resize_img[1]= Tkinter.PhotoImage(file=imagesPath + \
            "/resize2.gif")
        self.resize_img[2]= Tkinter.PhotoImage(file=imagesPath + \
            "/resize3.gif")
        self.resize_img[3]= Tkinter.PhotoImage(file=imagesPath + \
            "/resize4.gif")

        params_img= Tkinter.PhotoImage(file=imagesPath + \
            "/params.gif")

        self.indexStandalone_img = {}
        self.indexStandalone_img[0] = Tkinter.PhotoImage(file=imagesPath + \
            "/indexStandalone_disabled.gif")
        self.indexStandalone_img[1] = Tkinter.PhotoImage(file=imagesPath + \
            "/indexStandalone_enabled.gif")

        # define buttons

        self.button_resize = Tkinter.Button(self, \
          image=self.resize_img[self.resizeCoeff % 4], \
          relief=Tkinter.FLAT, bd=0, height=150, width=150, \
          command=self.resize)
        self.button_resize.image = self.resize_img[self.resizeCoeff % 4]
        self.button_resize.grid(row=0,column=0, columnspan=1,sticky='W')
        tooltip = ToolTip(self.button_resize,translate("modify image resolution"), None, 0.1)

        self.button_indexStandalone = Tkinter.Button(self, \
          image=self.indexStandalone_img[self.indexStandalone_param], \
          relief=Tkinter.FLAT, bd=0, height=150, width=150, \
          command=self.indexStandalone)
        self.button_indexStandalone.image = self.indexStandalone_img[self.indexStandalone_param]
        self.button_indexStandalone.grid(row=0,column=1, columnspan=1,sticky='W')
        tooltip3 = ToolTip(self.button_indexStandalone,translate("index standalone"), None, 0.1)

    def resize(self):
        self.resizeCoeff = (self.resizeCoeff + 1) % 4
        self.parent.resize = self.resizeCoeff
        self.button_resize.configure(image=self.resize_img[self.resizeCoeff])

    def indexStandalone(self):
        self.indexStandalone_param = (self.indexStandalone_param + 1) % 2
        if self.indexStandalone_param == 1:
            self.parent.options['export_type'] = "singlefile"
        else:
            self.parent.options['export_type'] = "local"
        self.button_indexStandalone.configure(image=self.indexStandalone_img[self.indexStandalone_param])


    def quit(self):
        self.root.destroy()
