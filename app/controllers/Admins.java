package controllers;

import java.util.List;

import models.Administrator;
import common.core.WebController;
import dao.AdminDao;

public class Admins extends WebController {

    public static void list() {
        List<Administrator> admins = Administrator.all().fetch();
        render("/Admins/list.html", admins);
    }
    
}
