from twilio.rest import TwilioRestClient
import MySQLdb as mdb
import sys

# Your Account Sid and Auth Token from twilio.com/user/account
accountSid = "";
authToken = "";

client = TwilioRestClient(accountSid, authToken)

def selectSet(sql):
        try:
            con = mdb.connect('localhost', 'txtapp', 'RKFDVrFFf2FRGwtC', 'txtapp');
            with con:
                cur = con.cursor(mdb.cursors.DictCursor)
                cur.execute(sql)
                rows = cur.fetchall()
                
                return rows;    
        except mdb.Error, e:  
            print "Error %d: %s" % (e.args[0],e.args[1])
            sys.exit(1)
    
        finally:         
            if con:
                con.close()
        
def findTargetsForCampaign(id):
    targets = "select * from campaign_target_sets cts, target_sets ts where cts.target_set_id = ts.id and cts.alert_id = " + str(id);
  
    targetSet = selectSet(targets);
    for row in targetSet:
      print "for campaign ", row["alert_id"], " geo target ",  row["geo_target"];
    return targetSet;  
 
def getSubscribersForGeo(geoArea):
    # todo
    # special case for geo area 00
    subscribers = "select * from subscriber where status = 1 and state = '" + geoArea + "'";  
    print subscribers;
    subscriberSet = selectSet(subscribers); 
    return subscriberSet;
      
def findUpcoming():
    
  upcoming = "SELECT id,sms, DATE(FROM_UNIXTIME(`send`)) FROM alert WHERE DATE(FROM_UNIXTIME(`send`)) > DATE(NOW()) and status = 0 order by DATE(FROM_UNIXTIME(`send`))";  
  rows = selectSet(upcoming)

  return rows;    

def sendAlertToSubscriber():


campaigns = findUpcoming();
for row in campaigns:
    print "campaign: ", row["id"], row["sms"]
    alert_id = row["id"];
    t = findTargetsForCampaign(alert_id);
    for targetSet in t:
        print "target set id: ", targetSet["id"], " geo target ", targetSet["geo_target"]
        geoSet = getSubscribersForGeo(targetSet["geo_target"]);
        for subscriber in geoSet:
            print "subscriber phone #", subscriber["number"];
        
                
# $alerts->findAlertToSend())
#foreach($subscribers->findForAlert($alert) as $subscriber){
#$log->debug("Sending to {$subscriber->number}");
#$sms = $twilio->sendSms($alert->sms, $subscriber->number);
#update subscriber sent?

#connect to mysql


#send a text message with campaign message 
#message = client.messages.create(body="Jenny please?! I love you <3",
#    to="+14159352345",    # Replace with your phone number
#    from_="+14158141829") # Replace with your Twilio number
#print message.sid

#how to make an outgoing phonecall
#https://www.twilio.com/docs/api/rest/making-calls
 
# Your Account Sid and Auth Token from twilio.com/user/account
#account_sid = "AC54c7d2121438b83cea448d3e0cd6bb0e"
#uth_token  = "{{ auth_token }}"
#client = TwilioRestClient(account_sid, auth_token)
 
#call = client.calls.create(url="http://demo.twilio.com/docs/voice.xml",
#    to="+14155551212",
#    from_="+14158675309")
#print call.sid


# receive incoming sms
# https://www.twilio.com/docs/quickstart/php/sms

