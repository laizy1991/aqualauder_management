package exception;

/**
 * 
 * @author Daniel@warthog.cn
 * @createDate 2016年3月16日
 *
 */
public class BusinessException extends Exception  {

    private String message;
    
    public BusinessException(String message) {  
        super(message);
        this.message = message;
    }  
    
    public String getMessage() {
    	return this.message;
    }
}
