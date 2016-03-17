package controllers.ajax;

import models.Administrator;

import common.core.AjaxController;

public class Admins extends AjaxController {
    public static void add(Administrator admin) {
        if (admin != null) {
            admin.setCreateTime(System.currentTimeMillis());
            admin.setModifyTime(System.currentTimeMillis());
            admin.create();
        }
        renderSuccessJson();
    }

    public static void delete(Administrator admin) {
        if(admin != null) {
            admin.delete();
        }
        renderSuccessJson();
    }

    public static void update(Administrator admin) {
        if(admin != null) {
            admin.setModifyTime(System.currentTimeMillis());
            admin.save();
        }
        renderSuccessJson();
    }
    
}
