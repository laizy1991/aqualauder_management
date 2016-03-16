package dao;

import java.util.List;

import models.Administrator;

import org.apache.commons.collections.CollectionUtils;

import play.Logger;

/**
 * 
 * @author Daniel@warthog.cn
 * @createDate 2016年3月16日
 *
 */
public class AdminDao {

    public static boolean insert(Administrator admin) {
        if(admin == null) {
            return false;
        }
        return admin.create();
    }
    
    public static Administrator getByName(String userName) {
        List<Administrator> list = Administrator.find("username", userName).fetch();
        if(CollectionUtils.isEmpty(list)) {
            return null;
        }
        
        if(list.size() > 1) {
            Logger.error("too many admin find. userName:" + userName);
            return null;
        }
        
        return list.get(0);
    }
    
    public static void update(Administrator admin) {
        if(admin == null || admin.getId() == null) {
            return;
        }
        
        admin.save();
    }
    
}
